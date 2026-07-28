import { Module } from '@nestjs/common';
import { PagosService } from '../application/use_cases/pagos.service';
import { PagosController } from './controllers/pagos.controller';

@Module({
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
