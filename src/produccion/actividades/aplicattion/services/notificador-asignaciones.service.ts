import { Inject, Injectable, Logger } from "@nestjs/common";
import { Notificacion } from "../../../../modules/notificaciones/domain/entities/notificacion.entity";
import { NOTIFICACION_REPOSITORY } from "../../../../modules/notificaciones/domain/ports/notificacion.repository.token";
import type { NotificacionRepositoryPort } from "../../../../modules/notificaciones/domain/ports/notificacion.repository.port";

@Injectable()
export class NotificadorAsignacionesService {
    private readonly logger = new Logger(NotificadorAsignacionesService.name);

    constructor(
        @Inject(NOTIFICACION_REPOSITORY)
        private readonly notificaciones: NotificacionRepositoryPort,
    ) {}

    async enviar(usuarioId: number, titulo: string, mensaje: string, metadata: Record<string, unknown>): Promise<void> {
        try {
            await this.notificaciones.guardar(Notificacion.crear({
                id: 0,
                usuarioId,
                titulo,
                mensaje,
                tipo: 'tarea',
                metadata,
            }));
        } catch (error) {
            this.logger.warn(`No se pudo notificar al usuario ${usuarioId}: ${(error as Error).message}`);
        }
    }
}
