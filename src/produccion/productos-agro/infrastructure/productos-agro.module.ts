import { Module } from '@nestjs/common';
import { ProductosAgroService } from '../application/use-cases/productos-agro.service';
import { ProductosAgroController } from './controllers/productos-agro.controller';

@Module({
  controllers: [ProductosAgroController],
  providers: [ProductosAgroService],
})
export class ProductosAgroModule {}
