export class usoHerramienta {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public insumoId: number,
        public horasUsadas: number,
        public depreciacionGenerada: number,
        public valorLibrosAntes: number,
        public valorLibrosDespues: number,
        public readonly fechaUso: Date,
    ) {}

    static crear(props: {
        actividadId: number;
        insumoId: number,
        horasUsadas: number,
        valorLibrosAntes: number;
        tasaDepreciacionHora: number;
        fechaUso: Date;
    }): usoHerramienta {
        if(props.horasUsadas <= 0) throw new Error('las horas usadas deben ser mayores a 0');
        if(props.valorLibrosAntes <0) throw new Error('El valor en libros no puede ser negativo');
        if(props.tasaDepreciacionHora <0) throw new Error('La tasa de depreciación no puede ser negativa');

        const depreciacionCalculada = props.horasUsadas * props.tasaDepreciacionHora;
        const depreciacionGenerada = Math.min(depreciacionCalculada, props.valorLibrosAntes);
        const valorLibrosDespues = props.valorLibrosAntes - depreciacionGenerada;

        return new usoHerramienta(
            null,
            props.actividadId,
            props.insumoId,
            props.horasUsadas,
            depreciacionGenerada,
            props.valorLibrosAntes,
            valorLibrosDespues,
            props.fechaUso,
        );
    }
}