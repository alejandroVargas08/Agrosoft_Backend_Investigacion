import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPreciosLoteEntity } from '../domain/entities/historial_precios_lote.entity';
import { HistorialPreciosLoteService } from '../application/use-cases/historial_precios_lote.service';
import { HistorialPreciosLoteController } from '../infrastructure/controllers/historial_precios_lote.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialPreciosLoteEntity])],
  controllers: [HistorialPreciosLoteController],
  providers: [HistorialPreciosLoteService],
  exports: [HistorialPreciosLoteService, TypeOrmModule],
})
export class HistorialPreciosLoteModule {}