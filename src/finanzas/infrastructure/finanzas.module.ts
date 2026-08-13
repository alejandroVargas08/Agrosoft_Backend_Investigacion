import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanzaEntity } from '../domain/entities/finanza.entity'; 
import { FinanzasService } from '../application/use-cases/finanzas.service';
import { FinanzasController } from './controllers/finanzas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinanzaEntity]), 
  ],
  providers: [FinanzasService],
  controllers: [FinanzasController],
})
export class FinanzasModule {}