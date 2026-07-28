import { Module } from '@nestjs/common';
import { FacturasService } from '../application/use-cases/facturas.service';
import { FacturasController } from './controllers/facturas.controller';

@Module({
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
