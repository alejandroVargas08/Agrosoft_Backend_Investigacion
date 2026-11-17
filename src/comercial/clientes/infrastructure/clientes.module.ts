import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from '../application/use-cases/clientes.service';
import { ClientesController } from './controllers/clientes.controller';
import { Cliente } from '../domain/entities/cliente.entity';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
  imports: [
        IamModule,
        TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}