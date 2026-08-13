import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiTipoEpa } from '../../../domain/entities/wiki-tipo-epa.entity';
import type { WikiTipoEpaRepositoryPort } from '../../../domain/ports/wiki-tipo-epa.repository.port';
import { WikiTipoEpaOrmEntity } from '../entities/wiki-tipo-epa.orm-entity';
import { WikiTipoEpaMapper } from '../mappers/wiki-tipo-epa.mapper';

@Injectable()
export class WikiTipoEpaRepository implements WikiTipoEpaRepositoryPort {
  constructor(
    @InjectRepository(WikiTipoEpaOrmEntity)
    private readonly ormRepository: Repository<WikiTipoEpaOrmEntity>,
  ) {}

  async guardar(tipoEpa: WikiTipoEpa): Promise<WikiTipoEpa> {
    const orm = WikiTipoEpaMapper.toOrm(tipoEpa);
    const guardado = await this.ormRepository.save(orm);
    return WikiTipoEpaMapper.toDomain(guardado);
  }

  async actualizar(id: number, tipoEpa: WikiTipoEpa): Promise<WikiTipoEpa> {
    const orm = await this.ormRepository.preload({ ...WikiTipoEpaMapper.toOrm(tipoEpa), id });
    if (!orm) throw new NotFoundException(`No existe un tipo de EPA con id ${id}`);
    const actualizado = await this.ormRepository.save(orm);
    return WikiTipoEpaMapper.toDomain(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<WikiTipoEpa | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? WikiTipoEpaMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<WikiTipoEpa[]> {
    const filas = await this.ormRepository.find();
    return filas.map(WikiTipoEpaMapper.toDomain);
  }
}