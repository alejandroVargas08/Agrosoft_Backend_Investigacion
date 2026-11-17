import { Incidencia } from "../entities/incidencia.entity";

export const Incidencia_Repository = Symbol('Incidencia_Repository');

export interface IncidenciaRepositoryPort {
    crear(incidencia: Incidencia): Promise<Incidencia>;
    buscarPorId(id: number): Promise<Incidencia | null>;
    listar(cultivoId?: number): Promise<Incidencia[]>;
    listarVisibles(cultivoIdsPermitidos: number[] | null, cultivoId?: number): Promise<Incidencia[]>;
    idsVisibles(cultivoIdsPermitidos: number[] | null): Promise<number[] | null>;
    actualizar(incidencia: Incidencia): Promise<Incidencia>;
    eliminar(id: number): Promise<void>;
}
