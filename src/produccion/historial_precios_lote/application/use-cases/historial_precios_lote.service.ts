import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialPreciosLoteEntity } from '../../domain/entities/historial_precios_lote.entity';
import { CreateHistorialPreciosLoteDto } from '../../application/dto/create-historial_precios_lote.dto';
import { UpdateHistorialPreciosLoteDto } from '../../application/dto/update-historial_precios_lote.dto';

@Injectable()
export class HistorialPreciosLoteService {
  constructor(
    @InjectRepository(HistorialPreciosLoteEntity)
    private readonly historialRepository: Repository<HistorialPreciosLoteEntity>,
  ) {}

  async create(dto: CreateHistorialPreciosLoteDto): Promise<HistorialPreciosLoteEntity> {
    const nuevo = this.historialRepository.create(dto);
    return await this.historialRepository.save(nuevo);
  }

  async findAll(): Promise<HistorialPreciosLoteEntity[]> {
    return await this.historialRepository.find();
  }

  async findOne(id: number): Promise<HistorialPreciosLoteEntity> {
    const registro = await this.historialRepository.findOneBy({ id });
    if (!registro) {
      throw new NotFoundException(`Registro de historial con ID ${id} no encontrado`);
    }
    return registro;
  }

  async findByLote(loteProduccionId: number): Promise<HistorialPreciosLoteEntity[]> {
    return await this.historialRepository.find({
      where: { loteProduccionId },
      order: { fecha: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateHistorialPreciosLoteDto): Promise<HistorialPreciosLoteEntity> {
    const registro = await this.findOne(id);
    this.historialRepository.merge(registro, dto);
    return await this.historialRepository.save(registro);
  }

  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.historialRepository.softDelete(registro.id);
  }
}