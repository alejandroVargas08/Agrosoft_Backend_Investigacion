import { actividadInsumoUso } from "../entities/actividad-insumos-uso.entity";

export const actividad_InsumoUsoRepository = Symbol('actividad_InsumoUsoRepository');
    export interface actividadInsumoUsoRepositoryPort {
        crear(item: actividadInsumoUso): Promise<actividadInsumoUso>;
        buscarPorId(id: number): Promise<actividadInsumoUso | null>; 
        listarActividad(actividadId: number): Promise<actividadInsumoUso[]>;
        actualizar(item: actividadInsumoUso): Promise<actividadInsumoUso>;
    }