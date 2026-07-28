import { Module } from '@nestjs/common';
import { ClientesService } from '../application/use-cases/clientes.service';
import { ClientesController } from './controllers/clientes.controller';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
