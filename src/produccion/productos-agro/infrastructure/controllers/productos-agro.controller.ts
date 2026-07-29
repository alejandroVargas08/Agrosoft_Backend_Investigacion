import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductosAgroService } from '../../application/use-cases/productos-agro.service';
import { CreateProductoAgroDto } from '../../application/dto/create-productos-agro.dto';
import { UpdateProductoAgroDto } from '../../application/dto/update-productos-agro.dto';

@Controller('productos-agro')
export class ProductosAgroController {
  constructor(private readonly productosAgroService: ProductosAgroService) {}

  @Post()
  create(@Body() dto: CreateProductoAgroDto) {
    return this.productosAgroService.create(dto);
  }

  @Get()
  findAll() {
    return this.productosAgroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosAgroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductoAgroDto) {
    return this.productosAgroService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosAgroService.remove(id);
  }
}