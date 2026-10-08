import { Incidencia } from "../entities/incidencia.entity";

export const Incidencia_Repository = Symbol('Incidencia_Repository');

export interface IncidenciaRepositoryPort {
    crear(incidencia: Incidencia): Promise<Incidencia>;
    buscarPorId(id: number): Promise<Incidencia | null>;
    listar(cultivoId?: number): Promise<Incidencia[]>;
    actualizar(incidencia: Incidencia): Promise<Incidencia>;
    eliminar(id: number): Promise<void>;
}