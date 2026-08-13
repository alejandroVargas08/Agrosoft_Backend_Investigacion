import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaEntity } from '../domain/entities/venta.entity';
import { VentasService } from '../application/use-cases/ventas.service';
import { VentasController } from './controllers/ventas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VentaEntity])],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService, TypeOrmModule],
})
export class VentasModule {}