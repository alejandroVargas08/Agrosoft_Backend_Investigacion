export type SeveridadIncidencia = 'low' | 'medium' | 'high';
export type EstadoIncidencia = 'open' | 'in_treatment' | 'resolved';

export class Incidencia {
    constructor(
        public readonly id: number | null,
        public titulo: string,
        public tipo: string,
        public severidad: SeveridadIncidencia,
        public estado: EstadoIncidencia,
        public cultivoId: number | null,
        public fecha: Date,
        public descripcion: string | null,
    ) {}

    cambiarEstado(nuevoEstado: EstadoIncidencia) {
        if (this.estado === nuevoEstado) {
            throw new Error('La incidencia ya está en ese estado');
        }
        this.estado = nuevoEstado;
    }
}