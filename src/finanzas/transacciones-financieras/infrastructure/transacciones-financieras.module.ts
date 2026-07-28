import { Module } from '@nestjs/common';
import { TransaccionesFinancierasService } from '../application/use_cases/transacciones-financieras.service';
import { TransaccionesFinancierasController } from './controllers/transacciones-financieras.controller';

@Module({
  controllers: [TransaccionesFinancierasController],
  providers: [TransaccionesFinancierasService],
})
export class TransaccionesFinancierasModule {}
