import { actividadHerramienta } from "../entities/actividad-herramientas.entity";

export const actividad_HerramientasRepository = Symbol ('actividad_HerramietasRepository');

export interface actividad_HerramientasRepositoryPort {
    crear(item: actividadHerramienta): Promise<actividadHerramienta>;
    buscarPorId(id: number): Promise<actividadHerramienta | null>;
    listarPorActividad(actividadId: number): Promise<actividadHerramienta[]>;
    actualizar(item: actividadHerramienta): Promise<actividadHerramienta>;
    eliminar(id: number): Promise<void>;
}