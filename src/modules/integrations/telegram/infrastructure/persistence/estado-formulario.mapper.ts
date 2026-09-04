import { EstadoFormularioOrmEntity } from './estado-formulario.orm-entity';
import { EstadoConversacion, EstadoFormulario } from '../../domain/entities/estado-formulario.entity';

export class EstadoFormularioMapper {
    static aDominio(orm: EstadoFormularioOrmEntity): EstadoFormulario {
        return EstadoFormulario.reconstruir({
        id: orm.id,
        telegramUserId: orm.telegramUserId,
        step: orm.step,
        data: orm.data,
        estado: orm.estado as EstadoConversacion,
        accessToken: orm.accessToken,
        updatedAt: orm.updatedAt,
        });
    }

    static aOrm(estadoFormulario: EstadoFormulario): Partial<EstadoFormularioOrmEntity> {
        return {
        id: estadoFormulario.id,
        telegramUserId: estadoFormulario.telegramUserId,
        step: estadoFormulario.step,
        data: estadoFormulario.data,
        estado: estadoFormulario.estado,
        accessToken: estadoFormulario.accessToken,
        };
    }
}