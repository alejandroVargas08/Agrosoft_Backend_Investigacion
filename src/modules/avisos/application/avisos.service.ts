import { Inject, Injectable, Logger } from '@nestjs/common';
import { NOTIFICACION_REPOSITORY } from '../../notificaciones/domain/ports/notificacion.repository.token';
import type { NotificacionRepositoryPort } from '../../notificaciones/domain/ports/notificacion.repository.port';
import { Notificacion } from '../../notificaciones/domain/entities/notificacion.entity';
import { Aviso, CanalAviso } from '../domain/aviso';
import { PreferenciasService } from './preferencias.service';

// El tipo con que se guarda en la campana; el frontend le pone icono y ruta por esto
const TIPO_NOTIFICACION: Record<Aviso['tipo'], string> = {
    alerta_sensor: 'alerta_sensor',
    stock_bajo: 'stock_bajo',
    actividad_vencida: 'tarea',
    incidencia: 'incidencia',
};

/** Reparte un aviso: a la campana de la app y a los canales registrados (Telegram). */
@Injectable()
export class AvisosService {
    private readonly logger = new Logger(AvisosService.name);
    private readonly canales: CanalAviso[] = [];

    constructor(
        private readonly preferencias: PreferenciasService,
        @Inject(NOTIFICACION_REPOSITORY) private readonly notificaciones: NotificacionRepositoryPort,
    ) {}

    registrarCanal(canal: CanalAviso) {
        if (!this.canales.some((c) => c.nombre === canal.nombre)) this.canales.push(canal);
    }

    /** Devuelve a cuántos les llegó, después de aplicar sus preferencias. */
    async emitir(destinatarios: number[], aviso: Aviso, metadata: Record<string, unknown> = {}): Promise<number> {
        const unicos = [...new Set(destinatarios)];
        const quieren = await this.preferencias.quienesQuieren(unicos, aviso.tipo);

        for (const usuarioId of quieren) {
            try {
                await this.notificaciones.guardar(Notificacion.crear({
                    id: 0,
                    usuarioId,
                    titulo: aviso.titulo,
                    mensaje: aviso.mensaje,
                    tipo: TIPO_NOTIFICACION[aviso.tipo],
                    metadata: { origen: 'aviso', ...metadata },
                }));
            } catch (error) {
                this.logger.warn(`No se guardó el aviso para el usuario ${usuarioId}: ${(error as Error).message}`);
            }
            // Un canal caído no detiene a los demás
            for (const canal of this.canales) {
                try {
                    await canal.enviar(usuarioId, aviso);
                } catch (error) {
                    this.logger.warn(`${canal.nombre}: no se pudo avisar al usuario ${usuarioId}: ${(error as Error).message}`);
                }
            }
        }
        return quieren.length;
    }
}
