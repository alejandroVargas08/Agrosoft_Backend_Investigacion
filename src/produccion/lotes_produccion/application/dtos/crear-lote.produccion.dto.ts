export interface CrearLoteProduccionDto {
    productoAgroId: number;
    cultivoId: number;
    loteId: number; 
    subLoteId?: number;
    actividadesCosechaId?: number; 
    calidad: string; 
    cantidadKg: number; 
    stockDisponibleKg: number;
    costoUnitarioKg: number; 
    costoTotal: number;
    precioSugeridoKg: number;
}