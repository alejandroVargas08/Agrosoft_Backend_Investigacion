import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaEntity } from '../domain/entities/venta.entity';
import { VentasService } from '../application/use-cases/ventas.service';
import { VentasController } from './controllers/ventas.controller';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
  imports: [
        IamModule,
        TypeOrmModule.forFeature([VentaEntity])],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService, TypeOrmModule],
})
export class VentasModule {}