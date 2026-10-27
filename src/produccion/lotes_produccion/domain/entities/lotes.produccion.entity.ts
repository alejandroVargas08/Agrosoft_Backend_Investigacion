export class loteProduccion{
    constructor(
        public readonly id: number | null,
        public productoAgroId: number,
        public cultivoId: number,
        public loteId: number,
        public subLoteId: number | null,
        public actividadesCosechaId: number | null,
        public calidad: string,
        public cantidadKg: number,
        public stockDisponibleKg: number,
        public costoUnitarioKg: number,
        public costoTotal: number,
        public precioSugeridoKg: number,
        // Trazabilidad de la cosecha: a donde fue, quien la hizo y notas
        public destino: string | null = null,
        public responsable: string | null = null,
        public observaciones: string | null = null,
        // Fecha en que se registro la cosecha (created_at en la tabla)
        public readonly fechaCosecha: Date | null = null,
    ) {}

    descontarStock(kg: number) {
        if (kg <= 0) {
            throw new Error('la cantidad a descontar debe de ser mayor a cero');
        }
        if (kg > this.stockDisponibleKg) {
            throw new Error('El stock disponible no puede quedar en negativo');
        }
        this.stockDisponibleKg -= kg;
    }
    /** Devuelve kilos al lote, por ejemplo cuando se anula una venta. */
    reponerStock(kg: number) {
        if (kg <= 0) {
            throw new Error('la cantidad a reponer debe de ser mayor a cero');
        }
        if (this.stockDisponibleKg + kg > this.cantidadKg) {
            throw new Error('El stock disponible no puede superar lo cosechado');
        }
        this.stockDisponibleKg += kg;
    }

    recalcularCostoTotal() {
        this.costoTotal = this.cantidadKg * this.costoUnitarioKg;
    }
}