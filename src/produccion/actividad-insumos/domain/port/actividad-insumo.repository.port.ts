import { actividadInsumo } from "../entities/actividad-insumos.entity";

export const actividad_InsumoRepository = Symbol('actividad_InsumoRepository');
export interface actividadInsumoRepositoryPort {
    crear(item: actividadInsumo): Promise<actividadInsumo>;
    buscarPorId(id: number): Promise<actividadInsumo | null>;
    listarPorActividad(actividadId: number): Promise<actividadInsumo[]>;
    eliminar(id: number): Promise<void>;
}