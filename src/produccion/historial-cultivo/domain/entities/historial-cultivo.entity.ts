export class historialCultivo {
    constructor(
        public readonly id: number | null,
        public readonly cultivoId: number,
        public readonly usuarioId: number, 
        public readonly motivo: string, 
        public readonly cambios: Record <string, any>
    ) {}
} 