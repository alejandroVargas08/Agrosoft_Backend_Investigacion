import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Epa } from '../../../domain/entities/epa.entity';
import type { EpaRepositoryPort } from '../../../domain/ports/epa.repository.port';
import { EpaOrmEntity } from '../entities/epa.orm-entity';
import { EpaMapper } from '../mappers/epa.mapper';

@Injectable()
export class EpaRepository implements EpaRepositoryPort {
  constructor(
    @InjectRepository(EpaOrmEntity)
    private readonly ormRepository: Repository<EpaOrmEntity>,
  ) {}

  async guardar(epa: Epa): Promise<Epa> {
    const orm = EpaMapper.toOrm(epa);
    const guardado = await this.ormRepository.save(orm);
    return EpaMapper.toDomain(guardado);
  }

  async actualizar(id: number, epa: Epa): Promise<Epa> {
    const orm = await this.ormRepository.preload({ ...EpaMapper.toOrm(epa), id });
    if (!orm) throw new NotFoundException(`No existe una EPA con id ${id}`);
    const actualizado = await this.ormRepository.save(orm);
    return EpaMapper.toDomain(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<Epa | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? EpaMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<Epa[]> {
    const filas = await this.ormRepository.find();
    return filas.map(EpaMapper.toDomain);
  }
}