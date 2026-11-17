
export type tipoMovimientoProduccion = 'entrada' | 'salida';
export class movimientoProduccion {
    constructor(
        public readonly id: number | null,
        public loteProduccionId: number,
        public tipo: tipoMovimientoProduccion,
        public cantidadKg: number,
        public costoUnitarioKg: number,
        public precioUnitarioKg: number,
        public costoTotal: number,
        public ventaId: number | null,
        public descripcion: string | null,
        public usuarioId: number, 
        public readonly fecha: Date,
    ) {}

    static crear(props: {
        loteProduccionId: number;
        tipo: tipoMovimientoProduccion;
        cantidadKg: number; 
        costoUnitarioKg: number;
        precioUnitarioKg: number; 
        ventaId?: number | null; 
        descripcion?: string | null;
        usuarioId: number; 
    }): movimientoProduccion {
        if(props.cantidadKg <= 0) throw new Error('La cantidad de kg debe ser mayor a 0');
        if(props.costoUnitarioKg <0) throw new Error('El costo unitario no puede ser negativo');
        if(props.precioUnitarioKg <0) throw new Error('El precio unitario no puede ser negativo');
        if(props.tipo === 'salida' && !props.ventaId && !props.descripcion) {
            throw new Error('Un movimiento de salida requiere una venta asociada o una descripción del motivo');
        }

        const costoTotal = props.cantidadKg * props.costoUnitarioKg;
        return new movimientoProduccion(
            null,
            props.loteProduccionId, 
            props.tipo, 
            props.cantidadKg,
            props.costoUnitarioKg, 
            props.precioUnitarioKg, 
            costoTotal,
            props.ventaId ?? null, 
            props.descripcion ?? null, 
            props.usuarioId, 
            new Date(),
        );
    }
}