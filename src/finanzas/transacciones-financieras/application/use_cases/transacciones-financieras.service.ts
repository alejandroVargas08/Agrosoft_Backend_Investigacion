import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransaccionesFinancieraEntity } from '../../domain/entities/transacciones-financiera.entity';
import { CreateTransaccionesFinancieraDto } from '../dto/create-transacciones-financiera.dto';
import { UpdateTransaccionesFinancieraDto } from '../dto/update-transacciones-financiera.dto';

@Injectable()
export class TransaccionesFinancierasService {
  constructor(
    @InjectRepository(TransaccionesFinancieraEntity)
    private readonly repo: Repository<TransaccionesFinancieraEntity>,
  ) {}

  create(dto: CreateTransaccionesFinancieraDto) {
    return this.repo.save(dto);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateTransaccionesFinancieraDto) {
    return this.repo.update(id, dto);
  }

  remove(id: number) {
    return this.repo.softDelete(id);
  }
}