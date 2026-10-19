import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ActividadAsignacion, EstadoAsignacion } from "../../../domain/entities/actividad-asignacion.entity";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { actividades_repository } from "../../../domain/ports/actividades.repository.port";
import type { actividadesRepositoryPort } from "../../../domain/ports/actividades.repository.port";
import { EntregarTareaDto } from "../../dto/asignaciones.dto";
import { NotificadorAsignacionesService } from "../../services/notificador-asignaciones.service";
import { AsignacionRespuesta, PresentadorAsignacionesService } from "../../services/presentador-asignaciones.service";

const ESTADOS_VALIDOS: EstadoAsignacion[] = ['ASIGNADA', 'EN_PROGRESO', 'ENTREGADA', 'APROBADA', 'DEVUELTA'];

@Injectable()
export class MisTareasUseCase {
    private readonly logger = new Logger(MisTareasUseCase.name);

    constructor(
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        @Inject(actividades_repository) private readonly actividades: actividadesRepositoryPort,
        private readonly presentador: PresentadorAsignacionesService,
        private readonly notificador: NotificadorAsignacionesService,
    ) {}

    async listar(aprendizId: number, estados?: string): Promise<AsignacionRespuesta[]> {
        const filtro = (estados ?? '')
            .split(',')
            .map((e) => e.trim().toUpperCase())
            .filter((e): e is EstadoAsignacion => ESTADOS_VALIDOS.includes(e as EstadoAsignacion));
        return this.presentador.presentar(await this.asignaciones.listarPorAprendiz(aprendizId, filtro));
    }

    async obtener(asignacionId: number, aprendizId: number): Promise<AsignacionRespuesta> {
        const asignacion = await this.propia(asignacionId, aprendizId);
        return (await this.presentador.presentar([asignacion]))[0];
    }

    async iniciar(asignacionId: number, aprendizId: number): Promise<AsignacionRespuesta> {
        const asignacion = await this.propia(asignacionId, aprendizId);
        this.aplicar(() => asignacion.iniciar());
        const guardada = await this.asignaciones.guardar(asignacion);
        await this.marcarActividadEnProgreso(asignacion.actividadId);
        return (await this.presentador.presentar([guardada]))[0];
    }

    async entregar(asignacionId: number, aprendizId: number, dto: EntregarTareaDto): Promise<AsignacionRespuesta> {
        const asignacion = await this.propia(asignacionId, aprendizId);
        this.aplicar(() => asignacion.entregar(dto.horasTrabajadas, dto.comentario?.trim() || null));
        const guardada = await this.asignaciones.guardar(asignacion);
        await this.marcarActividadEnProgreso(asignacion.actividadId);
        await this.notificador.enviar(
            asignacion.asignadoPorId,
            'Tarea entregada para revisar',
            `Un aprendiz entregó la tarea de la actividad ${asignacion.actividadId}.`,
            { asignacionId, actividadId: asignacion.actividadId },
        );
        return (await this.presentador.presentar([guardada]))[0];
    }

    private async propia(asignacionId: number, aprendizId: number): Promise<ActividadAsignacion> {
        const asignacion = await this.asignaciones.buscarPorId(asignacionId);
        if (!asignacion || asignacion.aprendizId !== aprendizId) {
            throw new NotFoundException(`Tarea ${asignacionId} no encontrada`);
        }
        return asignacion;
    }

    private aplicar(accion: () => void): void {
        try {
            accion();
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
    }

    private async marcarActividadEnProgreso(actividadId: number): Promise<void> {
        try {
            const actividad = await this.actividades.buscarPorId(actividadId);
            if (actividad && actividad.estado === 'Pendiente') {
                actividad.cambiarEstado('En_progreso');
                await this.actividades.actualizar(actividad);
            }
        } catch (error) {
            this.logger.warn(`No se pudo actualizar la actividad ${actividadId}: ${(error as Error).message}`);
        }
    }
}
