import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductosAgroService } from '../../application/use-cases/productos-agro.service';
import { CreateProductosAgroDto } from '../../application/dto/create-productos-agro.dto';
import { UpdateProductosAgroDto } from '../../application/dto/update-productos-agro.dto';

@Controller('productos-agro')
export class ProductosAgroController {
  constructor(private readonly productosAgroService: ProductosAgroService) {}

  @Post()
  create(@Body() createProductosAgroDto: CreateProductosAgroDto) {
    return this.productosAgroService.create(createProductosAgroDto);
  }

  @Get()
  findAll() {
    return this.productosAgroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosAgroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductosAgroDto: UpdateProductosAgroDto) {
    return this.productosAgroService.update(+id, updateProductosAgroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productosAgroService.remove(+id);
  }
}
