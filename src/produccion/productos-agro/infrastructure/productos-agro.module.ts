import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoAgroEntity } from '../domain/entities/productos-agro.entity';
import { ProductosAgroService } from '../application/use-cases/productos-agro.service';
import { ProductosAgroController } from './controllers/productos-agro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoAgroEntity])],
  controllers: [ProductosAgroController],
  providers: [ProductosAgroService],
  exports: [ProductosAgroService, TypeOrmModule],
})
export class ProductosAgroModule {}