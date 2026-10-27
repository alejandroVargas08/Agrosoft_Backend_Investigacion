import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { AccesoActividadesService } from "../../services/acceso-actividades.service";
import { AccesoAprendicesService } from "../../../../../modules/iam/application/services/acceso-aprendices.service";
import { ActividadAsignacion } from "../../../domain/entities/actividad-asignacion.entity";
import type { Actividades } from "../../../domain/entities/actividades.entity";
import { AsignacionRespuesta, PresentadorAsignacionesService } from "../../services/presentador-asignaciones.service";

export interface ResumenAprendiz {
    id: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    correo: string;
    telefono: string;
    idFicha: string | null;
    programaFormacionId: number | null;
    /** Asignaciones del aprendiz en actividades que el instructor puede ver. */
    tareas: number;
    aprobadas: number;
    /** Entregadas y esperando revisión. */
    entregadas: number;
    /** Con el plazo encima y todavía sin entregar. */
    vencidas: number;
    horas: number;
    /** Horas trabajadas x precio por hora de cada actividad. El precio no es
     *  uno solo: cada actividad trae el suyo, asi que se suma por asignacion. */
    costoHoras: number;
    ultimoIngreso: Date | null;
}

/**
 * El resumen que necesita el instructor para ver cómo va cada aprendiz de su
 * ficha. Sigue dos reglas que ya existían, para no inventar una tercera:
 *  - quién es aprendiz suyo, igual que AdministrarUsuarioUseCase.listarAprendices
 *  - qué asignación cuenta, por la visibilidad de la ACTIVIDAD, igual que
 *    RevisarAsignacionesUseCase.porRevisar
 */
@Injectable()
export class ResumenAprendicesUseCase {
    constructor(
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
        private readonly accesoAprendices: AccesoAprendicesService,
        private readonly presentador: PresentadorAsignacionesService,
    ) {}

    async ejecutar(alcance: AlcanceDatos, programaFormacionId?: number): Promise<ResumenAprendiz[]> {
        // Quien es aprendiz de este instructor lo decide el servicio de iam,
        // que es el mismo que usa GET /usuarios/aprendices
        const aprendices = await this.accesoAprendices.listar(alcance, programaFormacionId);
        if (aprendices.length === 0) return [];

        // Una sola consulta para todos, no una por aprendiz
        const asignaciones = await this.asignaciones.listarPorAprendices(
            aprendices.map((usuario) => usuario.obtenerId()),
        );

        // La visibilidad se resuelve por actividad y se cachea: varias
        // asignaciones comparten la misma actividad
        // Se guarda la actividad entera, no solo si es visible: se traia igual,
        // y asi se tiene el precio por hora sin una consulta extra
        const actividadesVistas = new Map<number, Actividades | null>();
        const porAprendiz = new Map<number, ResumenAprendiz>();

        for (const usuario of aprendices) {
            porAprendiz.set(usuario.obtenerId(), {
                id: usuario.obtenerId(),
                nombre: usuario.obtenerNombre(),
                apellido: usuario.obtenerApellido(),
                identificacion: usuario.obtenerIdentificacion(),
                correo: usuario.obtenerCorreo(),
                telefono: usuario.obtenerTelefono(),
                idFicha: usuario.obtenerIdFicha(),
                programaFormacionId: usuario.obtenerProgramaFormacionId(),
                tareas: 0,
                aprobadas: 0,
                entregadas: 0,
                vencidas: 0,
                horas: 0,
                costoHoras: 0,
                ultimoIngreso: usuario.obtenerLastLoginAt(),
            });
        }

        for (const asignacion of asignaciones) {
            if (!actividadesVistas.has(asignacion.actividadId)) {
                actividadesVistas.set(asignacion.actividadId, await this.actividadVisible(asignacion.actividadId, alcance));
            }
            const actividad = actividadesVistas.get(asignacion.actividadId);
            if (!actividad) continue;

            const resumen = porAprendiz.get(asignacion.aprendizId);
            if (!resumen) continue;

            const horas = asignacion.horasTrabajadas ?? 0;

            resumen.tareas += 1;
            if (asignacion.estado === 'APROBADA') resumen.aprobadas += 1;
            if (asignacion.estado === 'ENTREGADA') resumen.entregadas += 1;
            if (asignacion.estaVencida()) resumen.vencidas += 1;
            resumen.horas += horas;
            resumen.costoHoras += horas * (actividad.precioHoraActividad ?? 0);
        }

        // El servicio ya los devuelve ordenados por apellido, y el Map conserva
        // el orden de insercion
        return [...porAprendiz.values()];
    }

    /**
     * Las tareas de un aprendiz, para la línea de tiempo de su detalle. Solo
     * las de actividades que el instructor puede ver, y solo si el aprendiz
     * está dentro de su alcance.
     */
    async tareasDeAprendiz(aprendizId: number, alcance: AlcanceDatos): Promise<AsignacionRespuesta[]> {
        const suyos = await this.ejecutar(alcance);
        if (!suyos.some((resumen) => resumen.id === aprendizId)) {
            throw new NotFoundException(`Aprendiz ${aprendizId} no encontrado`);
        }

        const asignaciones = await this.asignaciones.listarPorAprendices([aprendizId]);
        const visibles: ActividadAsignacion[] = [];
        const vistas = new Map<number, Actividades | null>();

        for (const asignacion of asignaciones) {
            if (!vistas.has(asignacion.actividadId)) {
                vistas.set(asignacion.actividadId, await this.actividadVisible(asignacion.actividadId, alcance));
            }
            if (vistas.get(asignacion.actividadId)) visibles.push(asignacion);
        }

        return this.presentador.presentar(visibles);
    }

    /** La actividad si el alcance la deja ver, o null. Devolver la entidad en
     *  vez de un booleano no cuesta nada: ya se traia igual. */
    private async actividadVisible(actividadId: number, alcance: AlcanceDatos): Promise<Actividades | null> {
        try {
            return await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
        } catch {
            return null;
        }
    }
}
