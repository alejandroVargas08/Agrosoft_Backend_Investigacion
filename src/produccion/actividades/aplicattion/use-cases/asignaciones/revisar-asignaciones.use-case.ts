import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { ActividadAsignacion } from "../../../domain/entities/actividad-asignacion.entity";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { actividades_repository } from "../../../domain/ports/actividades.repository.port";
import type { actividadesRepositoryPort } from "../../../domain/ports/actividades.repository.port";
import { AccesoActividadesService } from "../../services/acceso-actividades.service";
import { NotificadorAsignacionesService } from "../../services/notificador-asignaciones.service";
import { AsignacionRespuesta, PresentadorAsignacionesService } from "../../services/presentador-asignaciones.service";

@Injectable()
export class RevisarAsignacionesUseCase {
    private readonly logger = new Logger(RevisarAsignacionesUseCase.name);

    constructor(
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        @Inject(actividades_repository) private readonly actividades: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
        private readonly presentador: PresentadorAsignacionesService,
        private readonly notificador: NotificadorAsignacionesService,
    ) {}

    async porRevisar(alcance: AlcanceDatos): Promise<AsignacionRespuesta[]> {
        const entregadas = await this.asignaciones.listarPorEstado('ENTREGADA');
        const visibles: ActividadAsignacion[] = [];
        const visibilidad = new Map<number, boolean>();

        for (const asignacion of entregadas) {
            if (!visibilidad.has(asignacion.actividadId)) {
                visibilidad.set(asignacion.actividadId, await this.esVisible(asignacion.actividadId, alcance));
            }
            if (visibilidad.get(asignacion.actividadId)) visibles.push(asignacion);
        }
        return this.presentador.presentar(visibles);
    }

    async aprobar(asignacionId: number, revisorId: number, comentario: string | null, alcance: AlcanceDatos): Promise<AsignacionRespuesta> {
        const asignacion = await this.obtenerVisible(asignacionId, alcance);
        this.aplicar(() => asignacion.aprobar(revisorId, comentario));
        const guardada = await this.asignaciones.guardar(asignacion);
        await this.finalizarActividadSiTodoAprobado(asignacion.actividadId);
        await this.notificador.enviar(
            asignacion.aprendizId,
            'Tarea aprobada',
            comentario ? `Tu tarea fue aprobada: ${comentario}` : 'Tu tarea fue aprobada.',
            { asignacionId, actividadId: asignacion.actividadId },
        );
        return (await this.presentador.presentar([guardada]))[0];
    }

    async devolver(asignacionId: number, revisorId: number, comentario: string, alcance: AlcanceDatos): Promise<AsignacionRespuesta> {
        const asignacion = await this.obtenerVisible(asignacionId, alcance);
        this.aplicar(() => asignacion.devolver(revisorId, comentario));
        const guardada = await this.asignaciones.guardar(asignacion);
        await this.notificador.enviar(
            asignacion.aprendizId,
            'Tarea devuelta para corregir',
            comentario,
            { asignacionId, actividadId: asignacion.actividadId },
        );
        return (await this.presentador.presentar([guardada]))[0];
    }

    private async obtenerVisible(asignacionId: number, alcance: AlcanceDatos): Promise<ActividadAsignacion> {
        const asignacion = await this.asignaciones.buscarPorId(asignacionId);
        if (!asignacion || !(await this.esVisible(asignacion.actividadId, alcance))) {
            throw new NotFoundException(`Asignación ${asignacionId} no encontrada`);
        }
        return asignacion;
    }

    private async esVisible(actividadId: number, alcance: AlcanceDatos): Promise<boolean> {
        try {
            await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
            return true;
        } catch {
            return false;
        }
    }

    private aplicar(accion: () => void): void {
        try {
            accion();
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
    }

    private async finalizarActividadSiTodoAprobado(actividadId: number): Promise<void> {
        try {
            const todas = await this.asignaciones.listarPorActividad(actividadId);
            if (todas.length === 0 || todas.some((a) => a.estado !== 'APROBADA')) return;
            const actividad = await this.actividades.buscarPorId(actividadId);
            if (!actividad) return;
            if (actividad.estado === 'Pendiente') actividad.cambiarEstado('En_progreso');
            if (actividad.estado === 'En_progreso') {
                actividad.cambiarEstado('Finalizada');
                await this.actividades.actualizar(actividad);
            }
        } catch (error) {
            this.logger.warn(`No se pudo finalizar la actividad ${actividadId}: ${(error as Error).message}`);
        }
    }
}
