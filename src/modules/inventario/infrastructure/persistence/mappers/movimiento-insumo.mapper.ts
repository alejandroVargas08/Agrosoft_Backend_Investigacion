import { MovimientoInsumoOrmEntity } from '../orm-entities/movimiento-insumo.orm-entity';
import { MovimientoInsumo, TipoMovimiento } from '../../../domain/entities/movimiento-insumo.entity';

export class MovimientoInsumoMapper {
    static aDominio(orm: MovimientoInsumoOrmEntity): MovimientoInsumo {
        return MovimientoInsumo.reconstruir({
        id: orm.id,
        insumoId: orm.insumoId,
        tipo: orm.tipo as TipoMovimiento,
        cantidadPresentacion: parseFloat(orm.cantidadPresentacion),
        cantidadUso: parseFloat(orm.cantidadUso),
        costoUnitarioPresentacion: parseFloat(orm.costoUnitarioPresentacion),
        costoUnitarioUso: parseFloat(orm.costoUnitarioUso),
        costoTotal: parseFloat(orm.costoTotal),
        valorInventarioResultante: parseFloat(orm.valorInventarioResultante),
        descripcion: orm.descripcion,
        actividadId: orm.actividadId,
        usuarioId: orm.usuarioId,
        almacenOrigenId: orm.almacenOrigenId,
        almacenDestinoId: orm.almacenDestinoId,
        });
    }

    static aOrm(movimiento: MovimientoInsumo): Partial<MovimientoInsumoOrmEntity> {
        return {
        id: movimiento.id,
        insumoId: movimiento.insumoId,
        tipo: movimiento.tipo,
        cantidadPresentacion: movimiento.cantidadPresentacion.toString(),
        cantidadUso: movimiento.cantidadUso.toString(),
        costoUnitarioPresentacion: movimiento.costoUnitarioPresentacion.toString(),
        costoUnitarioUso: movimiento.costoUnitarioUso.toString(),
        costoTotal: movimiento.costoTotal.toString(),
        valorInventarioResultante: movimiento.valorInventarioResultante.toString(),
        descripcion: movimiento.descripcion,
        actividadId: movimiento.actividadId,
        usuarioId: movimiento.usuarioId,
        almacenOrigenId: movimiento.almacenOrigenId,
        almacenDestinoId: movimiento.almacenDestinoId,
        };
    }
}