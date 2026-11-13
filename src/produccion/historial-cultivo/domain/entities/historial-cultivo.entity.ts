export class historialCultivo {
    constructor(
        public readonly id: number | null,
        public readonly cultivoId: number,
        public readonly usuarioId: number, 
        public readonly motivo: string, 
        public readonly cambios: Record <string, any>,
        // Solo al leer: cuándo se hizo y quién, para mostrarlo en el historial
        public readonly fecha: Date | null = null,
        public readonly usuarioNombre: string | null = null,
    ) {}
} 