export type EstadoTratamiento = 'scheduled' | 'applied';

export class Tratamiento {
    constructor(
        public readonly id: number | null,
        public incidenciaId: number | null,
        public producto: string,
        public dosis: string | null,
        public fecha: Date,
        public costo: number,
        public notas: string | null,
        public estado: EstadoTratamiento,
    ) {}

    cambiarEstado(nuevoEstado: EstadoTratamiento) {
        if (this.estado === nuevoEstado) {
            throw new Error('El tratamiento ya está en ese estado');
        }
        this.estado = nuevoEstado;
    }
}