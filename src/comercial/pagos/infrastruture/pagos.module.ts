import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoEntity } from '../domain/entities/pago.entity';
import { PagosService } from '../application/use_cases/pagos.service';
import { PagosController } from './controllers/pagos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PagoEntity])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService, TypeOrmModule],
})
export class PagosModule {}