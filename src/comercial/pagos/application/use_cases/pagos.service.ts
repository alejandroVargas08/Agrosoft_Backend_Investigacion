import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagoEntity } from '../../domain/entities/pago.entity';
import { CreatePagoDto } from '../../application/dto/create-pago.dto';
import { UpdatePagoDto } from '../../application/dto/update-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(PagoEntity)
    private readonly pagosRepository: Repository<PagoEntity>,
  ) {}

  async create(dto: CreatePagoDto): Promise<PagoEntity> {
    const nuevoPago = this.pagosRepository.create(dto);
    return await this.pagosRepository.save(nuevoPago);
  }

  async findAll(): Promise<PagoEntity[]> {
    return await this.pagosRepository.find();
  }

  async findOne(id: number): Promise<PagoEntity> {
    const pago = await this.pagosRepository.findOneBy({ id });
    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }
    return pago;
  }

  async findByVenta(ventaId: number): Promise<PagoEntity[]> {
    return await this.pagosRepository.find({
      where: { ventaId },
    });
  }

  async update(id: number, dto: UpdatePagoDto): Promise<PagoEntity> {
    const pago = await this.findOne(id);
    this.pagosRepository.merge(pago, dto);
    return await this.pagosRepository.save(pago);
  }

  async remove(id: number): Promise<void> {
    const pago = await this.findOne(id);
    await this.pagosRepository.softDelete(pago.id);
  }
}