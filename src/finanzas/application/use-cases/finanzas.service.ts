import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanzaEntity } from '../../domain/entities/finanza.entity';
import { CreateFinanzaDto } from '../dto/create-finanza.dto';
import { UpdateFinanzaDto } from '../dto/update-finanza.dto';

@Injectable()
export class FinanzasService {
  constructor(
    @InjectRepository(FinanzaEntity)
    private readonly finanzaRepo: Repository<FinanzaEntity>,
  ) {}

  async create(createDto: CreateFinanzaDto): Promise<FinanzaEntity> {
    const nuevaFinanza = this.finanzaRepo.create({
      ...createDto,
      ventaId: createDto.ventaId ?? undefined,
    });
    return await this.finanzaRepo.save(nuevaFinanza);
  }

  async findAll(): Promise<FinanzaEntity[]> {
    return await this.finanzaRepo.find();
  }

  async findOne(id: number): Promise<FinanzaEntity> {
    const finanza = await this.finanzaRepo.findOne({ where: { id } });
    if (!finanza) {
      throw new NotFoundException(`Registro financiero con ID ${id} no encontrado`);
    }
    return finanza;
  }

  async update(id: number, updateDto: UpdateFinanzaDto): Promise<FinanzaEntity> {
    const finanza = await this.findOne(id);
    this.finanzaRepo.merge(finanza, updateDto);
    return await this.finanzaRepo.save(finanza);
  }

  async remove(id: number): Promise<void> {
    const finanza = await this.findOne(id);
    await this.finanzaRepo.softRemove(finanza);
  }
}