export class actividadInsumoReserva {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public insumoId: number,
        public cantidadReservada: number,
    ) {}

    static crear(props: { 
        actividadId: number; 
        insumoId: number; 
        cantidadReservada: number
    }): actividadInsumoReserva {
        if (props.cantidadReservada <= 0) throw new Error('La cantidad reservada debe ser mayor a 0');
        return new actividadInsumoReserva(
            null, 
            props.actividadId,
            props.insumoId,
            props.cantidadReservada
        );
    }

    ajustarCantidad(nuevoCantidad: number) {
        if (nuevoCantidad <=0) throw new Error('La cantidad reservada debe ser mayor a 0');
        this.cantidadReservada = nuevoCantidad;
    }

    consumir(cantidad: number): boolean {
        if (cantidad <=0) throw new Error('La cantidad a consumir debe ser mayor a 0');
        if (cantidad > this.cantidadReservada) {
            throw new Error(
                `No se puede consumir ${cantidad}: solo hay ${this.cantidadReservada} reservado`,
            );
        }
        this.cantidadReservada -= cantidad;
        return this.cantidadReservada === 0;
    }
}