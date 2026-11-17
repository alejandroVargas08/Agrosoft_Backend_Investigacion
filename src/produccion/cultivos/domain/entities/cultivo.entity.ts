export type EstadoCultivo = 'activo' | 'finalizado' | 'cancelado'; 

export class Cultivo {
    constructor(

        public readonly id: number | null, 
        public nombreCultivo: string,
        public tipoCultivo: string, 
        public loteId: number, 
        public subLoteId: number | null,
        public fechaSiembra: Date,
        public fechaFinalizacion: Date | null, 
        public costoTotal: number,
        public estado: EstadoCultivo,
        // Área propia de la unidad. Si no se registra, se usa la del lote.
        public areaM2: number | null = null,
        // Lo que se planea invertir; el costoTotal es lo que de verdad se ha gastado
        public costoEstimado: number | null = null,
    ) {}

    finalizar(fecha: Date) {
        if (this.estado === 'finalizado') {
            throw new Error('El cultivo ha finalizado');
        }
        this.estado = 'finalizado';
        this.fechaFinalizacion = fecha;
    }
    
    agregarCosto(monto: number) {
        if (monto <0) throw new Error('El costo no puede ser menor a 0');
        this.costoTotal += monto;
    }
}