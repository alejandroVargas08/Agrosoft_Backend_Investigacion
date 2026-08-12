import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionesFinancierasService } from '../application/use_cases/transacciones-financieras.service';
import { TransaccionesFinancierasController } from './controllers/transacciones-financieras.controller';
import { TransaccionesFinancieraEntity } from '../domain/entities/transacciones-financiera.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransaccionesFinancieraEntity]),
  ],
  controllers: [TransaccionesFinancierasController],
  providers: [TransaccionesFinancierasService],
  exports: [TypeOrmModule], 
})
export class TransaccionesFinancierasModule {}