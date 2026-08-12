import { ReservaOrmEntity } from '../orm-entities/reserva.orm-entity';
import { EstadoReserva, Reserva } from '../../../domain/entities/reserva.entity';

export class ReservaMapper {
    static aDominio(orm: ReservaOrmEntity): Reserva {
        return Reserva.reconstruir({
        id: orm.id,
        insumoId: orm.insumoId,
        cantidad: parseFloat(orm.cantidad),
        fechaReserva: orm.fechaReserva,
        motivo: orm.motivo,
        estado: orm.estado as EstadoReserva,
        usuarioId: orm.usuarioId,
        actividadId: orm.actividadId,
        });
    }

    static aOrm(reserva: Reserva): Partial<ReservaOrmEntity> {
        return {
        id: reserva.id,
        insumoId: reserva.insumoId,
        cantidad: reserva.cantidad.toString(),
        fechaReserva: reserva.fechaReserva,
        motivo: reserva.motivo,
        estado: reserva.estado,
        usuarioId: reserva.usuarioId,
        actividadId: reserva.actividadId,
        };
    }
}