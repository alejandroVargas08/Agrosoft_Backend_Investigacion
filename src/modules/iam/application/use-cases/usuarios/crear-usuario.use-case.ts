import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { Usuario } from "../../../domain/entities/usuario.entity";
import type { UsuarioRepositoryPort } from "../../../domain/ports/usuario.repository.port";
import { USUARIO_REPOSITORY } from "../../../domain/ports/usuario.repository.token";
import type { RolRepositoryPort } from "../../../domain/ports/rol.repository.port";
import { ROL_REPOSITORY } from "../../../domain/ports/rol.repository.token";
import type { ProgramaFormacionRepositoryPort } from "../../../domain/ports/programa-formacion.repository.port";
import { PROGRAMA_FORMACION_REPOSITORY } from "../../../domain/ports/programa-formacion.repository.token";
import { Email } from "../../../domain/value-objects/email.vo";
import { Password } from "../../../domain/value-objects/password.vo";
import { CrearUsuarioDto } from "../../dto/usuarios/crear-usuario.dto";
import { aUsuarioPublico, UsuarioPublico } from "../../dto/usuarios/usuario-respuesta.mapper";

export const ROL_POR_DEFECTO = 'Aprendiz';

@Injectable()
export class CrearUsuarioUseCase {
    constructor(
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarioRepository: UsuarioRepositoryPort,
        @Inject(ROL_REPOSITORY)
        private readonly rolRepository: RolRepositoryPort,
        @Inject(PROGRAMA_FORMACION_REPOSITORY)
        private readonly programaRepository: ProgramaFormacionRepositoryPort,
    ) {}

    async ejecutar(dto: CrearUsuarioDto): Promise<UsuarioPublico> {
        Email.create(dto.email);
        Password.fromHash(dto.password);

        if (await this.usuarioRepository.buscarPorCorreo(dto.email)) {
            throw new ConflictException('Ya existe un usuario con ese correo');
        }

        if (dto.programaFormacionId !== undefined) {
            const programa = await this.programaRepository.buscarPorId(dto.programaFormacionId);
            if (!programa) {
                throw new BadRequestException(`El programa de formación ${dto.programaFormacionId} no existe`);
            }
        }

        // Un rol distinto del de por defecto es una solicitud: la cuenta nace
        // pendiente y un administrador decide si la aprueba.
        const nombreRol = dto.rolSolicitado?.trim() || ROL_POR_DEFECTO;
        const esSolicitud = nombreRol.toLowerCase() !== ROL_POR_DEFECTO.toLowerCase();

        const rol = await this.rolRepository.buscarPorNombre(nombreRol);
        if (!rol) {
            if (esSolicitud) {
                throw new BadRequestException(`El rol "${nombreRol}" no existe`);
            }
            throw new InternalServerErrorException(`No existe el rol "${ROL_POR_DEFECTO}" en la base de datos`);
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(dto.password, salt);

        const usuario = Usuario.crear({
            id: 0,
            nombre: dto.nombre,
            apellido: dto.apellido,
            identificacion: dto.identificacion,
            idFicha: dto.idFicha ?? undefined,
            programaFormacionId: dto.programaFormacionId ?? undefined,
            telefono: dto.telefono,
            correo: dto.email,
            contrasenaHash,
            rolId: rol.obtenerId(),
            estado: esSolicitud ? 'pendiente' : 'activo',
        });

        const guardado = await this.usuarioRepository.guardar(usuario);
        return aUsuarioPublico(guardado);
    }
}
