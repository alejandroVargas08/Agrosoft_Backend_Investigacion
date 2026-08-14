export interface cambioRegistrado{
    [campo: string]: { anterior: unknown; nuevo: unknown};
}
export class actividadHistorial {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public cultivoId: number,
        public usuarioId: number,
        public motivo: string,
        public cambios: cambioRegistrado,
        public readonly fechaCreacion: Date = new Date(),
    ) {}

    static crear(props: {
        actividadId: number;
        cultivoId: number,
        usuarioId: number;
        motivo: string;
        cambios: cambioRegistrado;
    }): actividadHistorial {
        if (!props.motivo || props.motivo.trim().length === 0) {
            throw new Error('El motivo del cambio es obligatorio');
        }

        if(!props.cambios || Object.keys(props.cambios).length === 0 ){
            throw new Error('Debe registrar al menos un campo modificado');
        }

        return new actividadHistorial(
            null,
            props.actividadId, 
            props.cultivoId, 
            props.usuarioId, 
            props.motivo, 
            props.cambios
        );
    }
}