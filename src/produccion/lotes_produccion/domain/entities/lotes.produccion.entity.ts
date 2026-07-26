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
    recalcularCostoTotal() {
        this.costoTotal = this.cantidadKg * this.costoUnitarioKg;
    }
}