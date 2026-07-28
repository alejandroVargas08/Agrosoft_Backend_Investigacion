import { Module } from '@nestjs/common';
import { FinanzasService } from '../application/use-cases/finanzas.service';
import { FinanzasController } from './controllers/finanzas.controller';

@Module({
  controllers: [FinanzasController],
  providers: [FinanzasService],
})
export class FinanzasModule {}
