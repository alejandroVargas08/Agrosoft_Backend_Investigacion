import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaDetalleEntity } from '../domain/entities/ventas-detalle.entity';
import { VentasDetallesService } from '../application/use-cases/ventas-detalles.service';
import { VentasDetallesController } from './controllers/ventas-detalles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VentaDetalleEntity])],
  controllers: [VentasDetallesController],
  providers: [VentasDetallesService],
  exports: [VentasDetallesService],
})
export class VentasDetallesModule {}