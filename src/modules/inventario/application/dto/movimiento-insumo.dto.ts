import { MovimientoInsumo, TipoMovimiento } from '../../domain/entities/movimiento-insumo.entity';

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
    cantidadPresentacion: number;
    cantidadUso: number;
    costoTotal: number;
    descripcion?: string;
    usuarioId: number;
    almacenOrigenId?: number;
    almacenDestinoId?: number;
    fecha?: string;
    stockResultante?: number;
}

export function toMovimientoOutput(movimiento: MovimientoInsumo): MovimientoOutput {
    return {
        id: movimiento.id as number,
        insumoId: movimiento.insumoId,
        tipo: movimiento.tipo,
        cantidadPresentacion: movimiento.cantidadPresentacion,
        cantidadUso: movimiento.cantidadUso,
        costoTotal: movimiento.costoTotal,
        descripcion: movimiento.descripcion,
        usuarioId: movimiento.usuarioId,
        almacenOrigenId: movimiento.almacenOrigenId,
        almacenDestinoId: movimiento.almacenDestinoId,
        fecha: movimiento.creadoEn ? movimiento.creadoEn.toISOString() : undefined,
    };
}