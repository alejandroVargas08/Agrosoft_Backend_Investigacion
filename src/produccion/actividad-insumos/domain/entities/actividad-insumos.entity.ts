export class actividadInsumo {
    constructor(
        public readonly id: number | null,
        public actividadId: number,
        public insumoId: number,
        public cantidadUsada: number,
        public unidad: string,
        public costoUnitario: number,
        public costoTotal: number,
        ) {} 

        static crear(props: {
            actividadId: number;
            insumoId: number;
            cantidadUsada: number;
            unidad: string; 
            costoUnitario: number;
            }): actividadInsumo {
                if(props.cantidadUsada <= 0) throw new Error('La cantidad usada debe de ser mayor a 0');
                if(!props.unidad || props.unidad.trim().length === 0) throw new Error('La unidad es obligatoria');
                if(props.costoUnitario <0) throw new Error('El costo unitario no puede ser menos o igual a 0');

                const costoTotal = props.cantidadUsada * props.costoUnitario;
                return new actividadInsumo(
                    null,
                    props.actividadId,
                    props.insumoId,
                    props.cantidadUsada,
                    props.unidad,
                    props.costoUnitario,
                    costoTotal
                );
            }

            actualizarCantidad(nuevaCantidad: number) {
                if(nuevaCantidad <= 0) throw new Error('La cantidad usada debe de ser mayor a 0');
                this.cantidadUsada = nuevaCantidad;
                this.costoTotal = this.cantidadUsada * this.costoUnitario;
            }
}