export class actividadHerramienta {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public insumoId: number,
        public activoFijoId: number | null,
        public horasEstimadas: number, 
    ) {}

    static crear(props: {
        actividadId: number;
        insumoId: number;
        activoFijoId: number | null;
        horasEstimadas: number;
    }): actividadHerramienta {
        if(props.horasEstimadas <= 0) {
            throw new Error('Las horas estimadas de uso deben ser mayores a 0');
        }

        return new actividadHerramienta(null, props.actividadId, props.insumoId, props.activoFijoId ?? null, props.horasEstimadas);
    }

    reEstimarHoras(nuevasHoras: number) {
        if(nuevasHoras <= 0) throw new Error('Las horas estimadas de uso deben ser mayores a 0');
        this.horasEstimadas = nuevasHoras;
    }
}