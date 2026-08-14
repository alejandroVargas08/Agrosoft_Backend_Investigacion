export class actividadResponsable {
    constructor (
        public readonly id: number | null,
        public actividadId: number,
        public usuarioId: number,
        public horas: number,
        public precioHora: number,
        public costo: number,
    ) {}

    static crear(props: {
        actividadId: number;
        usuarioId: number;
        horas: number; 
        precioHora: number;
    }): actividadResponsable {
        if (props.horas <= 0) throw new Error('Las horas trabajadas deben ser mayores a 0');
        if (props.precioHora <0) throw new Error('El precio por hora no puede ser negativo');

        const costo = props.horas * props.precioHora;
        return new actividadResponsable(
            null,
            props.actividadId,
            props.usuarioId,
            props.horas,
            props.precioHora,
            costo
        ); 
    }

    actualizarHoras(nuevasHoras: number) {
        if (nuevasHoras <= 0) throw new Error('Las horas trabajadas deben ser mayores a 0');
        this.horas = nuevasHoras;
        this.costo = this.horas * this.precioHora;
    }
}