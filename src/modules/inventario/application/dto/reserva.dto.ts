import { EstadoReserva } from '../../domain/entities/reserva.entity';

export interface CrearReservaInput {
    insumoId: number;
    cantidad: number;
    fechaReserva: Date;
    motivo?: string;
    usuarioId: number;
    actividadId?: number;
    }

    export interface ReservaOutput {
    id: number;
    insumoId: number;
    cantidad: number;
    estado: EstadoReserva;
}