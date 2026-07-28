import { Module } from '@nestjs/common';
import { HistorialPreciosLoteService } from '../application/use-cases/historial_precios_lote.service';
import { HistorialPreciosLoteController } from './controllers/historial_precios_lote.controller';

@Module({
  controllers: [HistorialPreciosLoteController],
  providers: [HistorialPreciosLoteService],
})
export class HistorialPreciosLoteModule {}
