import { TipoMovimiento } from '../../domain/entities/movimiento-insumo.entity';

export interface RegistrarMovimientoInput {
    insumoId: number;
    tipo: TipoMovimiento;
    cantidadPresentacion: number;
    cantidadUso: number;
    descripcion?: string;
    actividadId?: number;
    usuarioId: number;
    almacenOrigenId?: number;
    almacenDestinoId?: number;
    }

    export interface MovimientoOutput {
    id: number;
    insumoId: number;
    tipo: TipoMovimiento;
    cantidadUso: number;
    costoTotal: number;
    stockResultante: number;
}