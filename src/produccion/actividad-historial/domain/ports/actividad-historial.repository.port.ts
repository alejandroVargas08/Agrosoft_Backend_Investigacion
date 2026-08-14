import { actividadHistorial } from "../entities/actividad-historial.entity";

export const actividad_HistorialRepository = Symbol('actividad_HistorialRepository');

export interface actividadHistorialRepositoryPort {
    crear(historial: actividadHistorial): Promise<actividadHistorial>;
    listarActividad(actividadId: number): Promise<actividadHistorial[]>;
}