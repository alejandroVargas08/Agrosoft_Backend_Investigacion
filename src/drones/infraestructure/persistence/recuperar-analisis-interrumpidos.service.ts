import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * El análisis de un vuelo corre dentro del proceso del backend. Si el backend
 * se reinicia a mitad de camino, el análisis quedaba "Procesando" para siempre
 * y el vuelo bloqueado en "Analizando" (no se podía relanzar ni borrar).
 * Al arrancar, lo que quedó a medias se marca como error para poder repetirlo.
 */
@Injectable()
export class RecuperarAnalisisInterrumpidosService implements OnApplicationBootstrap {
  private readonly logger = new Logger('Drones');

  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const analisis: { vuelo_id: number }[] = await this.db.query(
        `UPDATE drone_analisis
            SET estado = 'ERROR', etapa = NULL, finalizado_en = now(),
                mensaje_error = 'El análisis se interrumpió porque el servidor se reinició. Vuelve a lanzarlo.'
          WHERE estado IN ('PENDIENTE', 'PROCESANDO')
          RETURNING vuelo_id`,
      );
      const [vuelos] = await this.db.query(
        `UPDATE drone_vuelos
            SET estado = CASE WHEN total_capturas > 0 THEN 'CON_IMAGENES' ELSE 'REGISTRADO' END
          WHERE estado = 'ANALIZANDO' AND eliminado_en IS NULL`,
      );
      const n = Array.isArray(analisis) ? analisis.length : 0;
      if (n > 0 || vuelos) this.logger.warn(`${n} análisis interrumpidos por un reinicio quedaron como error; se pueden volver a lanzar.`);
    } catch (error) {
      this.logger.warn(`No se pudieron revisar análisis interrumpidos: ${error instanceof Error ? error.message : error}`);
    }
  }
}
