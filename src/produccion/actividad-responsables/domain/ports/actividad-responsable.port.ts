import { actividadResponsable } from "../entities/actividad-responsable.entity"

export const actividad_ResponsableRepository = Symbol('actividad_ResponsableReposiotry');
export interface actividadResponsableRepositoryPort {
    crear(item: actividadResponsable): Promise<actividadResponsable>;
    buscarPorId(id: number): Promise<actividadResponsable | null>;
    existePorActividadYUsuario(actividadId: number, usuarioId: number): Promise<boolean>;
    listarPorActividad(actividadId: number): Promise<actividadResponsable[]>;
    actualizar(item: actividadResponsable): Promise<actividadResponsable>;
    eliminar(id: number): Promise<void>;
}