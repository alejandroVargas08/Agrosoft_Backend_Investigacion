import { ActividadAsignacion, EstadoAsignacion } from "../entities/actividad-asignacion.entity";

export const ACTIVIDAD_ASIGNACIONES_REPOSITORY = Symbol('ACTIVIDAD_ASIGNACIONES_REPOSITORY');

export interface ActividadAsignacionesRepositoryPort {
    guardar(asignacion: ActividadAsignacion): Promise<ActividadAsignacion>;
    buscarPorId(id: number): Promise<ActividadAsignacion | null>;
    buscarPorActividadYAprendiz(actividadId: number, aprendizId: number): Promise<ActividadAsignacion | null>;
    listarPorActividad(actividadId: number): Promise<ActividadAsignacion[]>;
    listarPorAprendiz(aprendizId: number, estados?: EstadoAsignacion[]): Promise<ActividadAsignacion[]>;
    /** Todas las asignaciones de un grupo de aprendices, en una sola consulta. */
    listarPorAprendices(aprendizIds: number[]): Promise<ActividadAsignacion[]>;
    listarPorEstado(estado: EstadoAsignacion): Promise<ActividadAsignacion[]>;
    eliminar(id: number): Promise<void>;
}
