import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoAgroEntity } from '../../domain/entities/productos-agro.entity';
import { CreateProductoAgroDto } from '../../application/dto/create-productos-agro.dto';
import { UpdateProductoAgroDto } from '../../application/dto/update-productos-agro.dto';

@Injectable()
export class ProductosAgroService {
  constructor(
    @InjectRepository(ProductoAgroEntity)
    private readonly productosRepository: Repository<ProductoAgroEntity>,
  ) {}

  async create(dto: CreateProductoAgroDto): Promise<ProductoAgroEntity> {
    const nuevo = this.productosRepository.create(dto);
    return await this.productosRepository.save(nuevo);
  }

  async findAll(): Promise<ProductoAgroEntity[]> {
    return await this.productosRepository.find();
  }

  async findOne(id: number): Promise<ProductoAgroEntity> {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) {
      throw new NotFoundException(`Producto agropecuario con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, dto: UpdateProductoAgroDto): Promise<ProductoAgroEntity> {
    const producto = await this.findOne(id);
    this.productosRepository.merge(producto, dto);
    return await this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productosRepository.softDelete(producto.id);
  }
}