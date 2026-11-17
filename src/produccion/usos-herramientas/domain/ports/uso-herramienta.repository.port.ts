import { usoHerramienta } from "../entities/uso-herramienta.entity";

export const uso_HerramientaRepository = Symbol ('uso_HerramientaRepository');
    export interface usoHerramientaRepositoryPort {
        crear(item: usoHerramienta): Promise<usoHerramienta>;
        listarPorActividad(actividadId: number): Promise<usoHerramienta[]>;
        obtenerUltimoValorLibros(insumoId: number): Promise<number | null>;
    }