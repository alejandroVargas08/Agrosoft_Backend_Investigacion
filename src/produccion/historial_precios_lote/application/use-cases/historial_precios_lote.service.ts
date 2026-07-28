import { Injectable } from '@nestjs/common';
import { CreateHistorialPreciosLoteDto } from '../dto/create-historial_precios_lote.dto';
import { UpdateHistorialPreciosLoteDto } from '../dto/update-historial_precios_lote.dto';

@Injectable()
export class HistorialPreciosLoteService {
  create(createHistorialPreciosLoteDto: CreateHistorialPreciosLoteDto) {
    return 'This action adds a new historialPreciosLote';
  }

  findAll() {
    return `This action returns all historialPreciosLote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historialPreciosLote`;
  }

  update(id: number, updateHistorialPreciosLoteDto: UpdateHistorialPreciosLoteDto) {
    return `This action updates a #${id} historialPreciosLote`;
  }

  remove(id: number) {
    return `This action removes a #${id} historialPreciosLote`;
  }
}
