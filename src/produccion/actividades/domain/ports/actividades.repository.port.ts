import { Actividades } from "../entities/actividades.entity";


export const actividades_repository = 'actividades_repository';
export interface actividadesRepositoryPort {
    crear(actividad: Actividades): Promise<Actividades>;
    buscarPorId(id: number): Promise<Actividades | null>;
    listarPorCultivo(cultivoId: number): Promise<Actividades[]>;
    actualizar(actividad: Actividades): Promise<Actividades>;
    eliminar(id: number): Promise<void>;
}
