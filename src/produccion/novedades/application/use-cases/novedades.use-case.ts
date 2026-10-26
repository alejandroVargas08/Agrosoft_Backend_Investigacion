import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlcanceDatos, UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { AccesoAprendicesService } from '../../../../modules/iam/application/services/acceso-aprendices.service';
import { EstadoNovedad, ESTADOS_NOVEDAD, Novedad } from '../../domain/entities/novedad.entity';
import { NOVEDAD_REPOSITORY } from '../../domain/ports/novedad.repository.port';
import type { NovedadRepositoryPort } from '../../domain/ports/novedad.repository.port';
import { ReportarNovedadDto, ResponderNovedadDto } from '../dtos/novedad.dto';

/** Lo que ve la pantalla: la novedad con el nombre de quien la reportó. */
export interface NovedadRespuesta {
    id: number | null;
    tipo: string;
    urgencia: string;
    estado: string;
    descripcion: string;
    actividadId: number | null;
    insumoId: number | null;
    nombreHerramienta: string | null;
    respuestaInstructor: string | null;
    respondidaEn: Date | null;
    creadoEn: Date;
    reportadaPor: { id: number; nombre: string; apellido: string } | null;
}

@Injectable()
export class NovedadesUseCase {
    constructor(
        @Inject(NOVEDAD_REPOSITORY) private readonly novedades: NovedadRepositoryPort,
        private readonly accesoAprendices: AccesoAprendicesService,
    ) {}

    /** Un aprendiz reporta algo. El autor sale de la sesión, no del cuerpo. */
    async reportar(dto: ReportarNovedadDto, usuario: UsuarioAutenticado): Promise<NovedadRespuesta> {
        if (dto.tipo === 'insumo_bajo' && dto.insumoId === undefined) {
            throw new BadRequestException('Indica cuál es el insumo que se está acabando');
        }
        if (dto.tipo === 'herramienta_danada' && !dto.nombreHerramienta?.trim()) {
            throw new BadRequestException('Indica cuál es la herramienta');
        }

        const novedad = new Novedad(
            null,
            dto.tipo,
            dto.urgencia,
            'pendiente',
            dto.descripcion.trim(),
            usuario.id,
            dto.actividadId ?? null,
            dto.insumoId ?? null,
            dto.nombreHerramienta?.trim() ?? null,
            null,
            null,
            null,
        );

        const creada = await this.novedades.crear(novedad);
        return this.presentar([creada], new Map())[0];
    }

    /** Las que reportó el usuario en sesión. */
    async mias(usuario: UsuarioAutenticado, estado?: string): Promise<NovedadRespuesta[]> {
        const propias = await this.novedades.listarPorAutor(usuario.id, this.estados(estado));
        return this.presentar(propias, new Map());
    }

    /**
     * Las de los aprendices que el instructor tiene a cargo. Usa el mismo
     * servicio que el listado de aprendices y el resumen, así que si un
     * aprendiz no sale en una pantalla tampoco sale aquí.
     */
    async deMisAprendices(alcance: AlcanceDatos, estado?: string): Promise<NovedadRespuesta[]> {
        const aprendices = await this.accesoAprendices.listar(alcance);
        const nombres = new Map(
            aprendices.map((a) => [
                a.obtenerId(),
                { id: a.obtenerId(), nombre: a.obtenerNombre(), apellido: a.obtenerApellido() },
            ]),
        );

        const lista = await this.novedades.listarPorAutores([...nombres.keys()], this.estados(estado));
        return this.presentar(lista, nombres);
    }

    async atender(id: number, dto: ResponderNovedadDto, usuario: UsuarioAutenticado): Promise<NovedadRespuesta> {
        return this.resolver(id, usuario, (novedad) => novedad.atender(dto.respuesta, usuario.id));
    }

    async descartar(id: number, dto: ResponderNovedadDto, usuario: UsuarioAutenticado): Promise<NovedadRespuesta> {
        return this.resolver(id, usuario, (novedad) => novedad.descartar(dto.respuesta, usuario.id));
    }

    private async resolver(
        id: number,
        usuario: UsuarioAutenticado,
        accion: (novedad: Novedad) => void,
    ): Promise<NovedadRespuesta> {
        const novedad = await this.novedades.buscarPorId(id);
        // Un instructor solo resuelve las de sus propios aprendices
        if (!novedad || !(await this.accesoAprendices.puedeVer(usuario, novedad.reportadaPorUsuarioId))) {
            throw new NotFoundException(`Novedad ${id} no encontrada`);
        }

        try {
            accion(novedad);
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }

        return this.presentar([await this.novedades.actualizar(novedad)], new Map())[0];
    }

    private estados(estado?: string): EstadoNovedad[] | undefined {
        if (!estado) return undefined;
        const pedidos = estado
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter((e): e is EstadoNovedad => ESTADOS_NOVEDAD.includes(e as EstadoNovedad));
        return pedidos.length > 0 ? pedidos : undefined;
    }

    private presentar(
        novedades: Novedad[],
        nombres: Map<number, { id: number; nombre: string; apellido: string }>,
    ): NovedadRespuesta[] {
        return novedades.map((n) => ({
            id: n.id,
            tipo: n.tipo,
            urgencia: n.urgencia,
            estado: n.estado,
            descripcion: n.descripcion,
            actividadId: n.actividadId,
            insumoId: n.insumoId,
            nombreHerramienta: n.nombreHerramienta,
            respuestaInstructor: n.respuestaInstructor,
            respondidaEn: n.respondidaEn,
            creadoEn: n.creadoEn,
            reportadaPor: nombres.get(n.reportadaPorUsuarioId) ?? null,
        }));
    }
}
