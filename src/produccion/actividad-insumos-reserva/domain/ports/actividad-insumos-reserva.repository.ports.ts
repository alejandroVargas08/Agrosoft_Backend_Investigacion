import { actividadInsumoReserva } from "../entities/actividad-insumos-reserva.entity";

export const actividad_insumoReservaRepository = Symbol ('actividad_insumoReservaRepository');

export interface actividadInsumoReservaRepositoryPort {
    crear(item: actividadInsumoReserva): Promise<actividadInsumoReserva>;
    buscarPorId(id: number): Promise<actividadInsumoReserva | null>;
    buscarActividadInsumoReserva(actividadId: number, insumoId: number): Promise<actividadInsumoReserva | null>;
    listarActividad(actividadId: number): Promise<actividadInsumoReserva[]>;
    actualizar(item: actividadInsumoReserva): Promise<actividadInsumoReserva>;
    eliminar(id: number): Promise<void>;
}

