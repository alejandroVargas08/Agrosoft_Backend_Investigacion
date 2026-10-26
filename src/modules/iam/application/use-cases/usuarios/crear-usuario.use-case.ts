import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import * as bcrypt from 'bcrypt';
import { EstadoUsuario, SolicitudRegistro, Usuario } from "../../../domain/entities/usuario.entity";
import type { UsuarioRepositoryPort } from "../../../domain/ports/usuario.repository.port";
import { USUARIO_REPOSITORY } from "../../../domain/ports/usuario.repository.token";
import type { RolRepositoryPort } from "../../../domain/ports/rol.repository.port";
import { ROL_REPOSITORY } from "../../../domain/ports/rol.repository.token";
import type { ProgramaFormacionRepositoryPort } from "../../../domain/ports/programa-formacion.repository.port";
import { PROGRAMA_FORMACION_REPOSITORY } from "../../../domain/ports/programa-formacion.repository.token";
import type { UsuarioProgramaRepositoryPort } from "../../../domain/ports/usuario-programa.repository.port";
import { USUARIO_PROGRAMA_REPOSITORY } from "../../../domain/ports/usuario-programa.repository.token";
import { ProgramaFormacion } from "../../../domain/entities/programa-formacion.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { Password } from "../../../domain/value-objects/password.vo";
import { CrearUsuarioDto, TipoUsuarioRegistro } from "../../dto/usuarios/crear-usuario.dto";
import { aUsuarioPublico, UsuarioPublico } from "../../dto/usuarios/usuario-respuesta.mapper";
import { Notificacion } from "../../../../notificaciones/domain/entities/notificacion.entity";
import type { NotificacionRepositoryPort } from "../../../../notificaciones/domain/ports/notificacion.repository.port";
import { NOTIFICACION_REPOSITORY } from "../../../../notificaciones/domain/ports/notificacion.repository.token";

export const ROL_POR_DEFECTO = 'Aprendiz';

const ROL_POR_TIPO: Record<TipoUsuarioRegistro, string> = {
    aprendiz: 'Aprendiz',
    instructor: 'Instructor',
    administrador: 'Administrador',
};

export interface UsuarioRegistrado extends UsuarioPublico {
    requiereAprobacion: boolean;
}

@Injectable()
export class CrearUsuarioUseCase {
    private readonly logger = new Logger(CrearUsuarioUseCase.name);

    constructor(
        private readonly moduleRef: ModuleRef,
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarioRepository: UsuarioRepositoryPort,
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepositoryPort,
        @Inject(PROGRAMA_FORMACION_REPOSITORY)
        private readonly programaRepository: ProgramaFormacionRepositoryPort,
        @Inject(USUARIO_PROGRAMA_REPOSITORY)
        private readonly usuarioProgramas: UsuarioProgramaRepositoryPort,
    ) {}

    async ejecutar(dto: CrearUsuarioDto): Promise<UsuarioRegistrado> {
        Email.create(dto.email);
        Password.fromHash(dto.password);

        if (await this.usuarioRepository.buscarPorCorreo(dto.email)) {
            throw new ConflictException('Ya existe un usuario con ese correo');
        }

        const tipo = dto.tipoUsuario ?? 'aprendiz';
        const programa = await this.programaPrincipal(dto);
        const fichasACargo = tipo === 'instructor' ? await this.resolverFichas(dto.fichasACargo ?? []) : [];

        let estado: EstadoUsuario = 'activo';
        let solicitud: SolicitudRegistro | null = null;

        if (tipo === 'administrador') {
            if (!dto.cargo?.trim() || !dto.motivoSolicitud?.trim()) {
                throw new BadRequestException('Para solicitar acceso de administrador escribe tu cargo y el motivo de la solicitud');
            }
            estado = 'pendiente';
            solicitud = this.nuevaSolicitud('Administrador', dto.cargo.trim(), dto.motivoSolicitud.trim(), []);
        }

        if (tipo === 'instructor') {
            const codigo = dto.codigoInstructor?.trim();
            if (codigo) {
                const codigoValido = process.env.CODIGO_REGISTRO_INSTRUCTOR?.trim().replace(/^["']|["']$/g, '');
                if (!codigoValido) {
                    throw new BadRequestException('El registro con código de instructor no está habilitado. Deja el código vacío para enviar tu solicitud al administrador.');
                }
                if (codigo.toLowerCase() !== codigoValido.toLowerCase()) {
                    throw new BadRequestException('El código de instructor no es válido. Déjalo vacío para enviar tu solicitud al administrador.');
                }
            } else {
                estado = 'pendiente';
                solicitud = this.nuevaSolicitud('Instructor', null, null, fichasACargo.map((p) => p.obtenerId()));
            }
        }

        const rol = await this.rolRepository.buscarPorNombre(ROL_POR_TIPO[tipo]);
        if (!rol) {
            throw new InternalServerErrorException(`No existe el rol "${ROL_POR_TIPO[tipo]}" en la base de datos`);
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(dto.password, salt);

        const usuario = Usuario.crear({
            id: 0,
            nombre: dto.nombre,
            apellido: dto.apellido,
            identificacion: dto.identificacion,
            idFicha: programa?.obtenerFicha() ?? dto.idFicha?.trim() ?? undefined,
            programaFormacionId: programa?.obtenerId() ?? undefined,
            telefono: dto.telefono,
            correo: dto.email,
            contrasenaHash,
            rolId: rol.obtenerId(),
            estado,
            solicitudRegistro: solicitud,
        });

        const guardado = await this.usuarioRepository.guardar(usuario);

        if (estado === 'activo' && tipo === 'instructor') {
            for (const ficha of fichasACargo) {
                await this.usuarioProgramas.asignar(guardado.obtenerId(), ficha.obtenerId());
            }
        }

        if (estado === 'pendiente' && solicitud) {
            await this.avisarAdministradores(guardado, solicitud.rolSolicitado);
        }

        return { ...aUsuarioPublico(guardado), requiereAprobacion: estado === 'pendiente' };
    }

    private async programaPrincipal(dto: CrearUsuarioDto): Promise<ProgramaFormacion | null> {
        const ficha = dto.idFicha?.trim();
        const porFicha = ficha ? await this.programaRepository.buscarPorFicha(ficha) : null;
        if (ficha && !porFicha && (dto.tipoUsuario ?? 'aprendiz') === 'aprendiz') {
            throw new BadRequestException(`La ficha ${ficha} no está registrada. Pide al administrador que la registre.`);
        }

        if (dto.programaFormacionId !== undefined) {
            const programa = await this.programaRepository.buscarPorId(dto.programaFormacionId);
            if (!programa) {
                throw new BadRequestException(`El programa de formación ${dto.programaFormacionId} no existe`);
            }
            if (porFicha && porFicha.obtenerId() !== programa.obtenerId()) {
                throw new BadRequestException(`La ficha ${ficha} no corresponde al programa seleccionado`);
            }
            return programa;
        }
        return porFicha;
    }

    private async resolverFichas(fichas: string[]): Promise<ProgramaFormacion[]> {
        const unicas = [...new Set(fichas.map((f) => f.trim()).filter(Boolean))];
        const programas: ProgramaFormacion[] = [];
        for (const ficha of unicas) {
            const programa = await this.programaRepository.buscarPorFicha(ficha);
            if (!programa) throw new BadRequestException(`La ficha ${ficha} no está registrada`);
            programas.push(programa);
        }
        return programas;
    }

    private async avisarAdministradores(usuario: Usuario, rolSolicitado: string): Promise<void> {
        try {
            const notificaciones = this.moduleRef.get<NotificacionRepositoryPort>(NOTIFICACION_REPOSITORY, { strict: false });
            const rolAdmin = await this.rolRepository.buscarPorNombre('Administrador');
            if (!rolAdmin) return;
            const administradores = (await this.usuarioRepository.obtenerTodos())
                .filter((u) => u.obtenerRolId() === rolAdmin.obtenerId() && u.estaActivo());
            for (const admin of administradores) {
                await notificaciones.guardar(Notificacion.crear({
                    id: 0,
                    usuarioId: admin.obtenerId(),
                    titulo: 'Nueva solicitud de acceso',
                    mensaje: `${usuario.obtenerNombreCompleto()} pidió acceso como ${rolSolicitado}.`,
                    tipo: 'solicitud',
                    metadata: { usuarioId: usuario.obtenerId(), rolSolicitado },
                }));
            }
        } catch (error) {
            this.logger.warn(`No se pudo avisar a los administradores: ${(error as Error).message}`);
        }
    }

    private nuevaSolicitud(rolSolicitado: SolicitudRegistro['rolSolicitado'], cargo: string | null, motivo: string | null, fichasACargo: number[]): SolicitudRegistro {
        return { rolSolicitado, cargo, motivo, fichasACargo, solicitadoEn: new Date().toISOString(), resueltoEn: null, motivoRechazo: null };
    }
}
