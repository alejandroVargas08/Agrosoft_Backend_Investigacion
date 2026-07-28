import { Injectable } from '@nestjs/common';
import { CreateVentasDetalleDto } from '../dto/create-ventas-detalle.dto';
import { UpdateVentasDetalleDto } from '../dto/update-ventas-detalle.dto';

@Injectable()
export class VentasDetallesService {
  create(createVentasDetalleDto: CreateVentasDetalleDto) {
    return 'This action adds a new ventasDetalle';
  }

  findAll() {
    return `This action returns all ventasDetalles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ventasDetalle`;
  }

  update(id: number, updateVentasDetalleDto: UpdateVentasDetalleDto) {
    return `This action updates a #${id} ventasDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} ventasDetalle`;
  }
}
