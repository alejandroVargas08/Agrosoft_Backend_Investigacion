import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaEntity } from '../../domain/entities/venta.entity';
import { CreateVentaDto } from '../../application/dto/create-venta.dto';
import { UpdateVentaDto } from '../../application/dto/update-venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(VentaEntity)
    private readonly ventasRepository: Repository<VentaEntity>,
  ) {}

  async create(dto: CreateVentaDto): Promise<VentaEntity> {
    const nuevaVenta = this.ventasRepository.create(dto);
    return await this.ventasRepository.save(nuevaVenta);
  }

  async findAll(): Promise<VentaEntity[]> {
    return await this.ventasRepository.find();
  }

  async findOne(id: number): Promise<VentaEntity> {
    const venta = await this.ventasRepository.findOneBy({ id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return venta;
  }

  async update(id: number, dto: UpdateVentaDto): Promise<VentaEntity> {
    const venta = await this.findOne(id);
    this.ventasRepository.merge(venta, dto);
    return await this.ventasRepository.save(venta);
  }

  async anularVenta(id: number, usuarioId: number): Promise<VentaEntity> {
    const venta = await this.findOne(id);
    venta.estado = 'anulada';
    venta.anuladaPorUsuarioId = usuarioId;
    venta.fechaAnulacion = new Date();
    return await this.ventasRepository.save(venta);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);
    await this.ventasRepository.softDelete(venta.id);
  }
}