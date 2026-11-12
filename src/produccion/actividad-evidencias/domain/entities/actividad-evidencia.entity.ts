export class actividadEvidencia {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public descripcion: string | null,
        public imagenes: string[],
        /**
         * La entrega del aprendiz a la que pertenece esta evidencia. Queda en
         * null cuando la evidencia es de la actividad en general y no de la
         * entrega de alguien en particular, que es lo que sube el instructor.
         */
        public asignacionId: number | null = null,
    ) {}

    static crear(props: {
        actividadId: number;
        descripcion?: string | null;
        imagenes?: string[];
        asignacionId?: number | null;
    }): actividadEvidencia {
        const imagenes = props.imagenes ?? [];
        const tieneDescripcion = !!props.descripcion && props.descripcion.trim().length > 0;
        const tieneImagenes = imagenes.length > 0;

        if (!tieneDescripcion && !tieneImagenes) {
            throw new Error('la evidencia debe de tener almenos una descripcion o una imagen');
        }

        return new actividadEvidencia(
            null,
            props.actividadId,
            props.descripcion ?? null,
            imagenes,
            props.asignacionId ?? null,
        );
    }

    agregarImagen(url: string) {
        if (!url) throw new Error('La URL de la imagen no puede estar vacía');
        this.imagenes.push(url);
    }

    quitarImagenes(url: string) {
        this.imagenes = this.imagenes.filter((img) => img !== url);
        if (this.imagenes.length === 0 && !this.descripcion) {
            throw new Error('No se puede dejar la evidencia sin descripcion ni imagenes');
        }
    }
}