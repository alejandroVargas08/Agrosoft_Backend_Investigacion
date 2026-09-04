import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaDetalleEntity } from '../../domain/entities/ventas-detalle.entity';
import { CreateVentaDetalleDto } from '../dto/create-ventas-detalle.dto';
import { UpdateVentaDetalleDto } from '../dto/update-ventas-detalle.dto';

@Injectable()
export class VentasDetallesService {
  constructor(
    @InjectRepository(VentaDetalleEntity)
    private readonly ventaDetalleRepo: Repository<VentaDetalleEntity>,
  ) {}

async create(dto: CreateVentaDetalleDto): Promise<VentaDetalleEntity> {
  
  const precioTotal = dto.cantidadKg * dto.precioUnitarioKg;
  
  const costoTotal = dto.costoUnitarioKg 
    ? dto.cantidadKg * dto.costoUnitarioKg 
    : undefined;

  
  const nuevoDetalle = this.ventaDetalleRepo.create({
    ventaId: dto.ventaId,
    productoAgroId: dto.productoAgroId,
    loteProduccionId: dto.loteProduccionId ?? undefined,
    cultivoId: dto.cultivoId ?? undefined,
    cantidadKg: dto.cantidadKg,
    precioUnitarioKg: dto.precioUnitarioKg,
    costoUnitarioKg: dto.costoUnitarioKg ?? undefined,
    precioTotal: precioTotal, 
    costoTotal: costoTotal,   
  });

  return await this.ventaDetalleRepo.save(nuevoDetalle);
}

  async findAll(): Promise<VentaDetalleEntity[]> {
    return await this.ventaDetalleRepo.find();
  }

  async findOne(id: number): Promise<VentaDetalleEntity> {
    const detalle = await this.ventaDetalleRepo.findOne({ where: { id } });
    if (!detalle) {
      throw new NotFoundException(`Detalle de venta con ID ${id} no encontrado`);
    }
    return detalle;
  }

  async update(id: number, updateDto: UpdateVentaDetalleDto): Promise<VentaDetalleEntity> {
    const detalle = await this.findOne(id);
    
    // Recalcular totales si cambian cantidades o precios
    const cantidadKg = updateDto.cantidadKg ?? detalle.cantidadKg;
    const precioUnitarioKg = updateDto.precioUnitarioKg ?? detalle.precioUnitarioKg;
    const costoUnitarioKg = updateDto.costoUnitarioKg ?? detalle.costoUnitarioKg;

    const precioTotal = cantidadKg * precioUnitarioKg;
    const costoTotal = costoUnitarioKg ? cantidadKg * costoUnitarioKg : null;

    Object.assign(detalle, updateDto, { precioTotal, costoTotal });

    return await this.ventaDetalleRepo.save(detalle);
  }

  async remove(id: number): Promise<void> {
    const detalle = await this.findOne(id);
    await this.ventaDetalleRepo.softDelete(detalle.id);
  }
  }