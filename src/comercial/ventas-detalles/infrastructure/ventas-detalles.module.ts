import { Module } from '@nestjs/common';
import { VentasDetallesService } from '../application/use-cases/ventas-detalles.service';
import { VentasDetallesController } from './controllers/ventas-detalles.controller';

@Module({
  controllers: [VentasDetallesController],
  providers: [VentasDetallesService],
})
export class VentasDetallesModule {}
