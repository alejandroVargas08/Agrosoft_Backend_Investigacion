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
    presentacionTipo: string;
    unidadUso: string;
    factorConversionUso: number;
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
    // Solo tienen valor en las herramientas. Estaban en la base y en el
    // dominio, pero este DTO las dejaba caer, asi que la vida util y la
    // depreciacion parecian no existir.
    costoAdquisicion?: number;
    valorResidual?: number;
    vidaUtilHoras?: number;
    horasUsadas?: number;
    depreciacionAcumulada?: number;
    }

    export function toInsumoOutput(insumo: Insumo): InsumoOutput {
    return {
        id: insumo.id as number,
        nombre: insumo.nombre,
        presentacionTipo: insumo.presentacionTipo,
        unidadUso: insumo.unidadUso,
        factorConversionUso: insumo.factorConversionUso,
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
        costoAdquisicion: insumo.costoAdquisicion,
        valorResidual: insumo.valorResidual,
        vidaUtilHoras: insumo.vidaUtilHoras,
        horasUsadas: insumo.horasUsadas,
        depreciacionAcumulada: insumo.depreciacionAcumulada,
    };
}