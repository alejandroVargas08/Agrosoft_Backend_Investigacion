import { Module } from '@nestjs/common';
import { VentasService } from '../application/use-cases/ventas.service';
import { VentasController } from './controllers/ventas.controller';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
