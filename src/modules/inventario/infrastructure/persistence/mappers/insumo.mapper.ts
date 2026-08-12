import { InsumoOrmEntity } from '../orm-entities/insumo.orm-entity';
import { EstadoInsumo, Insumo, TipoInsumo } from '../../../domain/entities/insumo.entity';

export class InsumoMapper {
    static aDominio(orm: InsumoOrmEntity): Insumo {
        return Insumo.reconstruir({
        id: orm.id,
        nombre: orm.nombre,
        descripcion: orm.descripcion,
        fotoUrl: orm.fotoUrl,
        presentacionTipo: orm.presentacionTipo,
        presentacionCantidad: parseFloat(orm.presentacionCantidad),
        presentacionUnidad: orm.presentacionUnidad,
        unidadUso: orm.unidadUso,
        tipoMateria: orm.tipoMateria,
        factorConversionUso: parseFloat(orm.factorConversionUso),
        stockPresentacion: parseFloat(orm.stockPresentacion),
        stockUso: parseFloat(orm.stockUso),
        stockReservado: parseFloat(orm.stockReservado),
        stockMinimo: parseFloat(orm.stockMinimo),
        precioUnitarioPresentacion: parseFloat(orm.precioUnitarioPresentacion),
        precioUnitarioUso: parseFloat(orm.precioUnitarioUso),
        almacenId: orm.almacenId,
        proveedorId: orm.proveedorId,
        categoriaId: orm.categoriaId,
        tipoInsumo: orm.tipoInsumo as TipoInsumo,
        estado: orm.estado as EstadoInsumo,
        costoAdquisicion: orm.costoAdquisicion ? parseFloat(orm.costoAdquisicion) : undefined,
        valorResidual: orm.valorResidual ? parseFloat(orm.valorResidual) : undefined,
        vidaUtilHoras: orm.vidaUtilHoras ? parseFloat(orm.vidaUtilHoras) : undefined,
        horasUsadas: orm.horasUsadas ? parseFloat(orm.horasUsadas) : undefined,
        depreciacionAcumulada: orm.depreciacionAcumulada ? parseFloat(orm.depreciacionAcumulada) : undefined,
        creadoPorUsuarioId: orm.creadoPorUsuarioId,
        deletedAt: orm.deletedAt,
        });
    }

    static aOrm(insumo: Insumo): Partial<InsumoOrmEntity> {
        return {
        id: insumo.id,
        nombre: insumo.nombre,
        descripcion: insumo.descripcion,
        fotoUrl: insumo.fotoUrl,
        presentacionTipo: insumo.presentacionTipo,
        presentacionCantidad: insumo.presentacionCantidad.toString(),
        presentacionUnidad: insumo.presentacionUnidad,
        unidadUso: insumo.unidadUso,
        tipoMateria: insumo.tipoMateria,
        factorConversionUso: insumo.factorConversionUso.toString(),
        stockPresentacion: insumo.stockPresentacion.toString(),
        stockUso: insumo.stockUso.toString(),
        stockReservado: insumo.stockReservado.toString(),
        stockMinimo: insumo.stockMinimo.toString(),
        precioUnitarioPresentacion: insumo.precioUnitarioPresentacion.toString(),
        precioUnitarioUso: insumo.precioUnitarioUso.toString(),
        almacenId: insumo.almacenId,
        proveedorId: insumo.proveedorId,
        categoriaId: insumo.categoriaId,
        tipoInsumo: insumo.tipoInsumo,
        estado: insumo.estado,
        costoAdquisicion: insumo.costoAdquisicion?.toString(),
        valorResidual: insumo.valorResidual?.toString(),
        vidaUtilHoras: insumo.vidaUtilHoras?.toString(),
        horasUsadas: insumo.horasUsadas?.toString(),
        depreciacionAcumulada: insumo.depreciacionAcumulada?.toString(),
        creadoPorUsuarioId: insumo.creadoPorUsuarioId,
        deletedAt: insumo.deletedAt ?? null,
        };
    }
}