import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ImportarAgroVisionUseCase } from '../../application/use-cases/epas/importar-agrovision.use-case';

/**
 * La primera vez que arranca el backend trae las fichas de AgroVisión a la
 * Wiki EPA. Si ya se importaron no vuelve a llamar la API (tiene límite por IP);
 * para refrescarlas está POST /epas/importar-agrovision. Se apaga con
 * AGROVISION_IMPORTAR=false.
 */
@Injectable()
export class ImportacionInicialAgroVisionService implements OnApplicationBootstrap {
  private readonly logger = new Logger('AgroVision');

  constructor(
    private readonly importar: ImportarAgroVisionUseCase,
    @InjectDataSource() private readonly db: DataSource,
  ) {}

  onApplicationBootstrap(): void {
    if (process.env.AGROVISION_IMPORTAR === 'false') return;
    void this.ejecutar();
  }

  private async ejecutar(): Promise<void> {
    try {
      const [{ ya }] = await this.db.query(
        `SELECT EXISTS (SELECT 1 FROM epas WHERE eliminado_en IS NULL AND EXISTS (
           SELECT 1 FROM unnest(etiquetas) t WHERE t LIKE 'agrovision:%')) AS ya`,
      );
      if (ya) return;
      const admins = await this.db.query(
        `SELECT u.id FROM usuarios u JOIN roles r ON r.id = u.rol_id
          WHERE r.nombre = 'Administrador' AND u.eliminado_en IS NULL ORDER BY u.id LIMIT 1`,
      );
      if (!admins.length) return;
      const r = await this.importar.execute(admins[0].id);
      this.logger.log(`Wiki EPA: ${r.creadas.length} fichas nuevas de AgroVisión, ${r.omitidas.length} omitidas`);
    } catch (error) {
      this.logger.warn(`No se importó AgroVisión: ${error instanceof Error ? error.message : error}`);
    }
  }
}
