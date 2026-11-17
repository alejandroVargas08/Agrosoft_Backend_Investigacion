import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { USUARIO_REPOSITORY } from "../../../../../modules/iam/domain/ports/usuario.repository.token";
import type { UsuarioRepositoryPort } from "../../../../../modules/iam/domain/ports/usuario.repository.port";
import { ACCESO_LOTES_PORT } from "../../../../../modules/territorio/domain/ports/acceso-lotes.port";
import type { AccesoLotesPort } from "../../../../../modules/territorio/domain/ports/acceso-lotes.port";
import { ActividadAsignacion } from "../../../domain/entities/actividad-asignacion.entity";
import { Actividades } from "../../../domain/entities/actividades.entity";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { actividades_repository } from "../../../domain/ports/actividades.repository.port";
import type { actividadesRepositoryPort } from "../../../domain/ports/actividades.repository.port";
import { AsignarActividadDto } from "../../dto/asignaciones.dto";
import { AccesoActividadesService } from "../../services/acceso-actividades.service";
import { NotificadorAsignacionesService } from "../../services/notificador-asignaciones.service";
import { AsignacionRespuesta, PresentadorAsignacionesService } from "../../services/presentador-asignaciones.service";

export interface ResultadoAsignacion {
    asignadas: AsignacionRespuesta[];
    omitidas: { aprendizId: number; motivo: string }[];
}

@Injectable()
export class GestionarAsignacionesUseCase {
    constructor(
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        @Inject(actividades_repository) private readonly actividades: actividadesRepositoryPort,
        @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
        @Inject(ACCESO_LOTES_PORT) private readonly accesoLotes: AccesoLotesPort,
        private readonly accesoActividades: AccesoActividadesService,
        private readonly presentador: PresentadorAsignacionesService,
        private readonly notificador: NotificadorAsignacionesService,
    ) {}

    async asignar(actividadId: number, dto: AsignarActividadDto, asignadoPorId: number, alcance: AlcanceDatos): Promise<ResultadoAsignacion> {
        const actividad = await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
        const fechaLimite = dto.fechaLimite ? new Date(dto.fechaLimite) : null;
        const asignadas: ActividadAsignacion[] = [];
        const omitidas: { aprendizId: number; motivo: string }[] = [];

        for (const aprendizId of [...new Set(dto.aprendizIds)]) {
            const motivo = await this.motivoParaNoAsignar(actividad, aprendizId, alcance);
            if (motivo) {
                omitidas.push({ aprendizId, motivo });
                continue;
            }
            const asignacion = await this.asignaciones.guardar(
                ActividadAsignacion.crear({ actividadId, aprendizId, asignadoPorId, fechaLimite }),
            );
            asignadas.push(asignacion);
            await this.notificador.enviar(
                aprendizId,
                'Nueva tarea asignada',
                `Te asignaron "${actividad.nombre || actividad.tipo}"${fechaLimite ? ` para el ${dto.fechaLimite}` : ''}.`,
                { asignacionId: asignacion.id, actividadId },
            );
        }

        if (asignadas.length === 0 && omitidas.length > 0) {
            throw new BadRequestException(omitidas.map((o) => `Aprendiz ${o.aprendizId}: ${o.motivo}`).join('. '));
        }

        return { asignadas: await this.presentador.presentar(asignadas), omitidas };
    }

    async listarPorActividad(actividadId: number, alcance: AlcanceDatos): Promise<AsignacionRespuesta[]> {
        await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
        return this.presentador.presentar(await this.asignaciones.listarPorActividad(actividadId));
    }

    async quitar(actividadId: number, asignacionId: number, alcance: AlcanceDatos): Promise<void> {
        await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
        const asignacion = await this.asignaciones.buscarPorId(asignacionId);
        if (!asignacion || asignacion.actividadId !== actividadId) {
            throw new NotFoundException(`Asignación ${asignacionId} no encontrada`);
        }
        if (asignacion.estado === 'APROBADA') {
            throw new ConflictException('No se puede quitar una tarea que ya fue aprobada');
        }
        await this.asignaciones.eliminar(asignacionId);
    }

    private async motivoParaNoAsignar(actividad: Actividades, aprendizId: number, alcance: AlcanceDatos): Promise<string | null> {
        const aprendiz = await this.usuarios.buscarPorId(aprendizId);
        if (!aprendiz || !aprendiz.estaActivo()) return 'no existe o no está activo';

        const programa = aprendiz.obtenerProgramaFormacionId();
        if (!alcance.verTodo && (programa === null || !alcance.programasPermitidos.includes(programa))) {
            return 'no pertenece a una ficha a tu cargo';
        }

        const alcanceAprendiz: AlcanceDatos = { verTodo: false, programasPermitidos: programa === null ? [] : [programa] };
        if (!(await this.accesoLotes.puedeAcceder(alcanceAprendiz, actividad.loteId))) {
            return 'el lote de la actividad es de otra ficha';
        }

        if (await this.asignaciones.buscarPorActividadYAprendiz(actividad.id!, aprendizId)) {
            return 'ya tiene esta actividad asignada';
        }
        return null;
    }
}
