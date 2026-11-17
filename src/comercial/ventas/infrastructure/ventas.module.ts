import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaEntity } from '../domain/entities/venta.entity';
import { VentaDetalleEntity } from '../../ventas-detalles/domain/entities/ventas-detalle.entity';
import { LotesProduccionModule } from '../../../produccion/lotes_produccion/infrastructure/lotes_produccion.module';
import { VentasService } from '../application/use-cases/ventas.service';
import { VentasController } from './controllers/ventas.controller';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
  imports: [
        IamModule,
        LotesProduccionModule,
        TypeOrmModule.forFeature([VentaEntity, VentaDetalleEntity])],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService, TypeOrmModule],
})
export class VentasModule {}