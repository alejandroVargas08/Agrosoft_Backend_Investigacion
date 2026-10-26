import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { ROL_REPOSITORY } from "../../../../../modules/iam/domain/ports/rol.repository.token";
import type { RolRepositoryPort } from "../../../../../modules/iam/domain/ports/rol.repository.port";
import { USUARIO_REPOSITORY } from "../../../../../modules/iam/domain/ports/usuario.repository.token";
import type { UsuarioRepositoryPort } from "../../../../../modules/iam/domain/ports/usuario.repository.port";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { AccesoActividadesService } from "../../services/acceso-actividades.service";

const ROL_APRENDIZ = 'Aprendiz';

export interface ResumenAprendiz {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    programaFormacionId: number | null;
    /** Asignaciones del aprendiz en actividades que el instructor puede ver. */
    tareas: number;
    aprobadas: number;
    /** Entregadas y esperando revisión. */
    entregadas: number;
    /** Con el plazo encima y todavía sin entregar. */
    vencidas: number;
    horas: number;
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
        @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
        @Inject(ROL_REPOSITORY) private readonly roles: RolRepositoryPort,
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async ejecutar(alcance: AlcanceDatos, programaFormacionId?: number): Promise<ResumenAprendiz[]> {
        const rol = await this.roles.buscarPorNombre(ROL_APRENDIZ);
        if (!rol) return [];

        const todos = await this.usuarios.obtenerTodos();
        const aprendices = todos
            .filter((usuario) => usuario.estaActivo() && usuario.obtenerRolId() === rol.obtenerId())
            .filter((usuario) => {
                const programa = usuario.obtenerProgramaFormacionId();
                if (programa === null) return false;
                if (programaFormacionId !== undefined && programa !== programaFormacionId) return false;
                return alcance.verTodo || alcance.programasPermitidos.includes(programa);
            });

        if (aprendices.length === 0) return [];

        // Una sola consulta para todos, no una por aprendiz
        const asignaciones = await this.asignaciones.listarPorAprendices(
            aprendices.map((usuario) => usuario.obtenerId()),
        );

        // La visibilidad se resuelve por actividad y se cachea: varias
        // asignaciones comparten la misma actividad
        const visibilidad = new Map<number, boolean>();
        const porAprendiz = new Map<number, ResumenAprendiz>();

        for (const usuario of aprendices) {
            porAprendiz.set(usuario.obtenerId(), {
                id: usuario.obtenerId(),
                nombre: usuario.obtenerNombre(),
                apellido: usuario.obtenerApellido(),
                correo: usuario.obtenerCorreo(),
                programaFormacionId: usuario.obtenerProgramaFormacionId(),
                tareas: 0,
                aprobadas: 0,
                entregadas: 0,
                vencidas: 0,
                horas: 0,
                ultimoIngreso: usuario.obtenerLastLoginAt(),
            });
        }

        for (const asignacion of asignaciones) {
            if (!visibilidad.has(asignacion.actividadId)) {
                visibilidad.set(asignacion.actividadId, await this.esVisible(asignacion.actividadId, alcance));
            }
            if (!visibilidad.get(asignacion.actividadId)) continue;

            const resumen = porAprendiz.get(asignacion.aprendizId);
            if (!resumen) continue;

            resumen.tareas += 1;
            if (asignacion.estado === 'APROBADA') resumen.aprobadas += 1;
            if (asignacion.estado === 'ENTREGADA') resumen.entregadas += 1;
            if (asignacion.estaVencida()) resumen.vencidas += 1;
            resumen.horas += asignacion.horasTrabajadas ?? 0;
        }

        return [...porAprendiz.values()].sort((a, b) =>
            `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'),
        );
    }

    private async esVisible(actividadId: number, alcance: AlcanceDatos): Promise<boolean> {
        try {
            await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
            return true;
        } catch {
            return false;
        }
    }
}
