import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionesFinancieraEntity } from '../../domain/entities/transacciones-financiera.entity'; // ajusta la ruta si aplica
import { Controller } from '@nestjs/common';
@Module({
  imports: [
    TypeOrmModule.forFeature([TransaccionesFinancieraEntity]),
  ],
  controllers: [TransaccionesFinancierasController],
  providers: [],
  exports: [TypeOrmModule],
})
@Controller('transacciones-financieras')
export class TransaccionesFinancierasController {}