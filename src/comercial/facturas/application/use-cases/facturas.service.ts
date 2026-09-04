import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacturaEntity } from '../../domain/entities/factura.entity';
import { CreateFacturaDto } from '../../application/dto/create-factura.dto';
import { UpdateFacturaDto } from '../../application/dto/update-factura.dto';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(FacturaEntity)
    private readonly facturasRepository: Repository<FacturaEntity>,
  ) {}

  async create(dto: CreateFacturaDto): Promise<FacturaEntity> {
    const nuevaFactura = this.facturasRepository.create(dto);
    return await this.facturasRepository.save(nuevaFactura);
  }

  async findAll(): Promise<FacturaEntity[]> {
    return await this.facturasRepository.find();
  }

  async findOne(id: number): Promise<FacturaEntity> {
    const factura = await this.facturasRepository.findOneBy({ id });
    if (!factura) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }
    return factura;
  }

  async findByVenta(ventaId: number): Promise<FacturaEntity[]> {
    return await this.facturasRepository.find({
      where: { ventaId },
    });
  }

  async update(id: number, dto: UpdateFacturaDto): Promise<FacturaEntity> {
    const factura = await this.findOne(id);
    this.facturasRepository.merge(factura, dto);
    return await this.facturasRepository.save(factura);
  }

  async remove(id: number): Promise<void> {
    const factura = await this.findOne(id);
    await this.facturasRepository.softDelete(factura.id);
  }
}