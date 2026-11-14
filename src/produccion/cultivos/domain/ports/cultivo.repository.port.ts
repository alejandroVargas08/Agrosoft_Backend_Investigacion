import { Cultivo } from "../entities/cultivo.entity";

export const Cultivo_Repository = Symbol('Cultivo_Repository');

export interface CultivoRepositoryPort {
    crear(cultivo: Cultivo) : Promise<Cultivo>;
    buscarPorId(id: number) : Promise<Cultivo | null >;
    listarPorLote(loteId: number) : Promise<Cultivo[]>;
    idsPorLotes(loteIds: number[]) : Promise<number[]>;
    // null = sin filtro (el usuario ve todos los lotes)
    listarActivos(ids: number[] | null) : Promise<Cultivo[]>;
    actualizar(cultivo: Cultivo) : Promise<Cultivo>;
    eliminar(id: number) : Promise<void>;
}