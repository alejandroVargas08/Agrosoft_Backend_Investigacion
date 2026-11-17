import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dron } from '../../../domain/entities/dron.entity';
import type { DronRepositoryPort } from '../../../domain/ports/dron.repository.port';
import { DronOrmEntity } from '../entities/dron.orm-entity';
import { DronMapper } from '../mappers/dron.mapper';

@Injectable()
export class DronRepository implements DronRepositoryPort {
  constructor(
    @InjectRepository(DronOrmEntity)
    private readonly ormRepository: Repository<DronOrmEntity>,
  ) {}

  async guardar(dron: Dron): Promise<Dron> {
    const guardado = await this.ormRepository.save(DronMapper.toOrm(dron));
    return DronMapper.toDomain(guardado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<Dron | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? DronMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<Dron[]> {
    const filas = await this.ormRepository.find({ order: { id: 'ASC' } });
    return filas.map(DronMapper.toDomain);
  }
}
