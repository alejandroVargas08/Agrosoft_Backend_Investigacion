import { historialCultivo } from "../entities/historial-cultivo.entity"

export const historial_CultivoRepository = Symbol('historial_CultivoRepository')

    export interface HistorialCultivoRepositoryPort {
        registrar(historial: historialCultivo): Promise<historialCultivo>;
        listarPorCultivo(cultivoId: number): Promise<historialCultivo[]>;
    }