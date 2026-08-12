import { EstadoInsumo, Insumo, TipoInsumo } from '../../domain/entities/insumo.entity';

export interface CrearInsumoInput {
    nombre: string;
    descripcion?: string;
    fotoUrl?: string;
    presentacionTipo: string;
    presentacionCantidad: number;
    presentacionUnidad: string;
    unidadUso: string;
    tipoMateria?: string;
    factorConversionUso: number;
    stockPresentacion: number;
    stockUso: number;
    stockMinimo: number;
    precioUnitarioPresentacion: number;
    precioUnitarioUso: number;
    almacenId: number;
    proveedorId: number;
    categoriaId: number;
    tipoInsumo: TipoInsumo;
    costoAdquisicion?: number;
    valorResidual?: number;
    vidaUtilHoras?: number;
    creadoPorUsuarioId?: number;
    }

    export interface InsumoOutput {
    id: number;
    nombre: string;
    stockPresentacion: number;
    stockUso: number;
    stockReservado: number;
    stockDisponible: number;
    stockMinimo: number;
    estado: EstadoInsumo;
    tipoInsumo: TipoInsumo;
    almacenId: number;
    proveedorId: number;
    categoriaId: number;
    valorInventario: number;
    }

    export function toInsumoOutput(insumo: Insumo): InsumoOutput {
    return {
        id: insumo.id as number,
        nombre: insumo.nombre,
        stockPresentacion: insumo.stockPresentacion,
        stockUso: insumo.stockUso,
        stockReservado: insumo.stockReservado,
        stockDisponible: insumo.stockDisponible(),
        stockMinimo: insumo.stockMinimo,
        estado: insumo.estado,
        tipoInsumo: insumo.tipoInsumo,
        almacenId: insumo.almacenId,
        proveedorId: insumo.proveedorId,
        categoriaId: insumo.categoriaId,
        valorInventario: insumo.valorInventario(),
    };
}