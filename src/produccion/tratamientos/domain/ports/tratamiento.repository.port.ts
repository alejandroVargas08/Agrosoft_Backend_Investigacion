import { Tratamiento } from "../entities/tratamiento.entity";

export const Tratamiento_Repository = Symbol('Tratamiento_Repository');

export interface TratamientoRepositoryPort {
    crear(tratamiento: Tratamiento): Promise<Tratamiento>;
    buscarPorId(id: number): Promise<Tratamiento | null>;
    listar(incidenciaId?: number): Promise<Tratamiento[]>;
    actualizar(tratamiento: Tratamiento): Promise<Tratamiento>;
    eliminar(id: number): Promise<void>;
}