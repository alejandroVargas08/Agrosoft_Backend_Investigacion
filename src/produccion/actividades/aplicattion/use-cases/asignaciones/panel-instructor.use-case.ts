import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../../domain/ports/actividad-asignaciones.repository.port";
import { AccesoActividadesService } from "../../services/acceso-actividades.service";
import { AccesoAprendicesService } from "../../../../../modules/iam/application/services/acceso-aprendices.service";
import { ESTADOS_ACTIVOS_ASIGNACION } from "../../../domain/entities/actividad-asignacion.entity";
import type { ActividadAsignacion } from "../../../domain/entities/actividad-asignacion.entity";
import type { Actividades } from "../../../domain/entities/actividades.entity";

/** Una actividad con plazo encima, y cuántos aprendices la tienen pendiente. */
export interface ProximaFechaLimite {
    actividadId: number;
    actividad: string;
    aprendices: number;
    fechaLimite: Date;
    diasRestantes: number;
}

/** Una actividad de la ficha, con cuanto lleva aprobado el grupo. */
export interface ActividadDeFicha {
    actividadId: number;
    actividad: string;
    estado: string;
    aprobadas: number;
    total: number;
}

export interface AprobadasPorSemana {
    /** La etiqueta del eje: el lunes de esa semana, como "Sep 1". */
    semana: string;
    aprobadas: number;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const SEMANAS_GRAFICA = 6;
const DIA_MS = 86400000;

/** El lunes de la semana a la que pertenece la fecha, a las 00:00. */
function inicioDeSemana(fecha: Date): Date {
    const dia = new Date(fecha);
    dia.setHours(0, 0, 0, 0);
    // getDay() da 0 para domingo: ahi el lunes esta 6 dias atras, no -1
    const desplazamiento = dia.getDay() === 0 ? 6 : dia.getDay() - 1;
    dia.setDate(dia.getDate() - desplazamiento);
    return dia;
}

function etiquetaSemana(lunes: Date): string {
    return MESES[lunes.getMonth()] + ' ' + lunes.getDate();
}

/**
 * Las dos agregaciones del panel del instructor. Reutiliza las mismas reglas
 * que ResumenAprendicesUseCase para no abrir una tercera forma de decidir qué
 * ve un instructor:
 *  - quién es aprendiz suyo, por AccesoAprendicesService
 *  - qué asignación cuenta, por la visibilidad de la ACTIVIDAD
 */
@Injectable()
export class PanelInstructorUseCase {
    constructor(
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY) private readonly asignaciones: ActividadAsignacionesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
        private readonly accesoAprendices: AccesoAprendicesService,
    ) {}

    /**
     * Las actividades con plazo todavía por delante, agrupadas: al instructor
     * le importa la actividad y a cuántos aprendices les falta, no cada
     * asignación suelta.
     */
    async proximasFechas(alcance: AlcanceDatos, limite = 3): Promise<ProximaFechaLimite[]> {
        const visibles = await this.asignacionesVisibles(alcance);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const porActividad = new Map<number, ProximaFechaLimite>();

        for (const { asignacion, actividad } of visibles) {
            if (!asignacion.fechaLimite) continue;
            // Solo lo que sigue abierto: una entrega ya hecha no es un plazo pendiente
            if (!ESTADOS_ACTIVOS_ASIGNACION.includes(asignacion.estado)) continue;

            const limiteDia = new Date(asignacion.fechaLimite);
            limiteDia.setHours(0, 0, 0, 0);
            const diasRestantes = Math.round((limiteDia.getTime() - hoy.getTime()) / DIA_MS);
            // Las vencidas tienen su propio contador en el panel
            if (diasRestantes < 0) continue;

            const yaVista = porActividad.get(asignacion.actividadId);
            if (yaVista) {
                yaVista.aprendices += 1;
                // Si dentro de la misma actividad hay plazos distintos, manda el más cercano
                if (limiteDia < yaVista.fechaLimite) {
                    yaVista.fechaLimite = limiteDia;
                    yaVista.diasRestantes = diasRestantes;
                }
                continue;
            }

            porActividad.set(asignacion.actividadId, {
                actividadId: asignacion.actividadId,
                actividad: actividad.nombre,
                aprendices: 1,
                fechaLimite: limiteDia,
                diasRestantes,
            });
        }

        return [...porActividad.values()]
            .sort((a, b) => a.fechaLimite.getTime() - b.fechaLimite.getTime())
            .slice(0, limite);
    }

    /**
     * Cuántas tareas aprobó el instructor cada semana, para la gráfica de
     * barras. Devuelve siempre las últimas SEMANAS_GRAFICA, con cero donde no
     * hubo ninguna: una barra que falta se lee distinto a una barra en cero.
     */
    async aprobadasPorSemana(alcance: AlcanceDatos): Promise<AprobadasPorSemana[]> {
        const semanas = new Map<number, AprobadasPorSemana>();

        const lunesActual = inicioDeSemana(new Date());
        for (let atras = SEMANAS_GRAFICA - 1; atras >= 0; atras--) {
            const lunes = new Date(lunesActual);
            lunes.setDate(lunes.getDate() - atras * 7);
            semanas.set(lunes.getTime(), { semana: etiquetaSemana(lunes), aprobadas: 0 });
        }

        const primerLunes = Math.min(...semanas.keys());
        const visibles = await this.asignacionesVisibles(alcance);

        for (const { asignacion } of visibles) {
            if (asignacion.estado !== 'APROBADA' || !asignacion.revisadaEn) continue;
            const lunes = inicioDeSemana(asignacion.revisadaEn).getTime();
            if (lunes < primerLunes) continue;
            const semana = semanas.get(lunes);
            if (semana) semana.aprobadas += 1;
        }

        return [...semanas.values()];
    }

    /**
     * Las actividades en las que trabaja una ficha, con el avance del grupo.
     * El diseño las muestra con una barra de "aprobadas sobre asignadas".
     */
    async actividadesDeFicha(alcance: AlcanceDatos, programaFormacionId: number): Promise<ActividadDeFicha[]> {
        const visibles = await this.asignacionesVisibles(alcance, programaFormacionId);
        const porActividad = new Map<number, ActividadDeFicha>();

        for (const { asignacion, actividad } of visibles) {
            let fila = porActividad.get(asignacion.actividadId);
            if (!fila) {
                fila = {
                    actividadId: asignacion.actividadId,
                    actividad: actividad.nombre,
                    estado: actividad.estado,
                    aprobadas: 0,
                    total: 0,
                };
                porActividad.set(asignacion.actividadId, fila);
            }
            fila.total += 1;
            if (asignacion.estado === 'APROBADA') fila.aprobadas += 1;
        }

        // Las que menos avance llevan primero: es lo que el instructor atiende
        return [...porActividad.values()].sort(
            (a, b) => a.aprobadas / a.total - b.aprobadas / b.total,
        );
    }

    /**
     * Las asignaciones de los aprendices del instructor cuya actividad él
     * puede ver, con su actividad al lado. Una sola consulta para todos los
     * aprendices, y la visibilidad cacheada por actividad.
     */
    private async asignacionesVisibles(
        alcance: AlcanceDatos,
        programaFormacionId?: number,
    ): Promise<{ asignacion: ActividadAsignacion; actividad: Actividades }[]> {
        const aprendices = await this.accesoAprendices.listar(alcance, programaFormacionId);
        if (aprendices.length === 0) return [];

        const asignaciones = await this.asignaciones.listarPorAprendices(
            aprendices.map((usuario) => usuario.obtenerId()),
        );

        const vistas = new Map<number, Actividades | null>();
        const visibles: { asignacion: ActividadAsignacion; actividad: Actividades }[] = [];

        for (const asignacion of asignaciones) {
            if (!vistas.has(asignacion.actividadId)) {
                vistas.set(asignacion.actividadId, await this.actividadVisible(asignacion.actividadId, alcance));
            }
            const actividad = vistas.get(asignacion.actividadId);
            if (actividad) visibles.push({ asignacion, actividad });
        }

        return visibles;
    }

    private async actividadVisible(actividadId: number, alcance: AlcanceDatos): Promise<Actividades | null> {
        try {
            return await this.accesoActividades.obtenerActividadVisible(actividadId, alcance);
        } catch {
            return null;
        }
    }
}
