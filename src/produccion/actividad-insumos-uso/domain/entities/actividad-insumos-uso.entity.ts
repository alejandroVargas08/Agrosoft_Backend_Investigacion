export class actividadInsumoUso {
    constructor(
        public readonly id: number 
        | null,
        public actividadId: number,
        public insumoId: number,
        public cantidadUso: number,
        public costoUnitarioUso: number,
        public costoTotal: number,
        public movimientoInsumoId: number | null, 
    ) {}

    static crear(props: {
        actividadId: number;
        insumoId: number,
        cantidadUso: number; 
        costoUnitarioUso: number; 
    }): actividadInsumoUso {
        if (props.cantidadUso <= 0) throw new Error('La cantidad usada debe ser mayor a 0');
        if (props.costoUnitarioUso < 0) throw new Error('El costo unitario no puede ser negativo');

        const costoTotal = props.cantidadUso * props.costoUnitarioUso;
        return new actividadInsumoUso(
            null, 
            props.actividadId,
            props.insumoId,
            props.cantidadUso,
            props.costoUnitarioUso,
            costoTotal,
            null
        );
    }

    vincularMovimiento(movimientoInsumoId: number) {
        if(this.movimientoInsumoId !== null) {
            throw new Error('Este registro de uso ya está vinculado a un movimiento de inventario');
        }

        this.movimientoInsumoId = movimientoInsumoId;
    }
}