import { Injectable } from '@nestjs/common';
import { CreateProductosAgroDto } from '../../application/dto/create-productos-agro.dto';
import { UpdateProductosAgroDto } from '../../application/dto/update-productos-agro.dto';

@Injectable()
export class ProductosAgroService {
  create(createProductosAgroDto: CreateProductosAgroDto) {
    return 'This action adds a new productosAgro';
  }

  findAll() {
    return `This action returns all productosAgro`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productosAgro`;
  }

  update(id: number, updateProductosAgroDto: UpdateProductosAgroDto) {
    return `This action updates a #${id} productosAgro`;
  }

  remove(id: number) {
    return `This action removes a #${id} productosAgro`;
  }
}
