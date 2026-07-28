export class actividadServicio {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public nombreServicio: string,
        public proveedorId: number,
        public maquinariaId: number,
        public horas: number,
        public precioHora: number,
        public costo: number,  
    ) {}

    static crear(props: {
        actividadId: number;
        nombreServicio: string;
        proveedorId: number;
        maquinariaId: number;
        horas: number;
        precioHora: number;
    }): actividadServicio { 

        if (props.horas <= 0) throw new Error('Las horas deben de ser mayores a 0');
        if (props.precioHora < 0) throw new Error('El precio no puede ser menor a 0');

        const costo = props.horas * props.precioHora;

        return new actividadServicio(
            null,
            props.actividadId,
            props.nombreServicio,
            props.proveedorId,
            props.maquinariaId,
            props.horas,
            props.precioHora,
            costo
        );
    }

    actualizarHoras(nuevasHoras: number) {
        if (nuevasHoras <= 0) throw new Error('Las horas de servicio deben de ser mayores a 0');
        this.horas = nuevasHoras;
        this.costo = this.horas * this.precioHora;
    }
}