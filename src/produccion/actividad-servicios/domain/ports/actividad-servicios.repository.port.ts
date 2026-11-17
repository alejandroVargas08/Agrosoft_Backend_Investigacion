import { actividadServicio } from "../entities/actividad-servicios.entity"

export const actividad_ServicioRepository = Symbol('actividad_ServicioRepository')

export interface actividadServicioRepositoryPort {
    crear(item: actividadServicio): Promise <actividadServicio>;
    buscarPorId(id: number): Promise <actividadServicio | null>;
    listarPorActividad(actividadId: number): Promise <actividadServicio[]>;
    actualizar(item: actividadServicio): Promise<actividadServicio>;
    eliminar(id: number): Promise<void>;
}