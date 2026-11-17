import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturaEntity } from '../domain/entities/factura.entity';
import { FacturasService } from '../application/use-cases/facturas.service';
import { FacturasController } from './controllers/facturas.controller';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
  imports: [
        IamModule,
        TypeOrmModule.forFeature([FacturaEntity])],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService, TypeOrmModule],
})
export class FacturasModule {}