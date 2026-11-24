import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/** Igual que en drones: una evaluación que el reinicio dejó a medias se marca como error. */
@Injectable()
export class RecuperarEvaluacionesInterrumpidasService implements OnApplicationBootstrap {
  private readonly logger = new Logger('DisenoTerreno');

  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const filas: unknown[] = await this.db.query(
        `UPDATE terreno_evaluaciones
            SET estado = 'ERROR', etapa = NULL, finalizado_en = now(),
                mensaje_error = 'La evaluación se interrumpió porque el servidor se reinició. Vuelve a solicitarla.'
          WHERE estado IN ('PENDIENTE', 'PROCESANDO')
          RETURNING id`,
      );
      if (Array.isArray(filas) && filas.length > 0) {
        this.logger.warn(`${filas.length} evaluaciones interrumpidas por un reinicio quedaron como error.`);
      }
    } catch (error) {
      this.logger.warn(`No se pudieron revisar evaluaciones interrumpidas: ${error instanceof Error ? error.message : error}`);
    }
  }
}
