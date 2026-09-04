import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoCultivoWiki } from '../../../domain/entities/tipo-cultivo-wiki.entity';
import type { TipoCultivoWikiRepositoryPort } from '../../../domain/ports/tipo-cultivo-wiki.repository.port';
import { TipoCultivoWikiOrmEntity } from '../entities/tipo-cultivo-wiki.orm-entity';
import { TipoCultivoWikiMapper } from '../mappers/tipo-cultivo-wiki.mapper';

@Injectable()
export class TipoCultivoWikiRepository implements TipoCultivoWikiRepositoryPort {
  constructor(
    @InjectRepository(TipoCultivoWikiOrmEntity)
    private readonly ormRepository: Repository<TipoCultivoWikiOrmEntity>,
  ) {}

  async guardar(tipoCultivo: TipoCultivoWiki): Promise<TipoCultivoWiki> {
    const orm = TipoCultivoWikiMapper.toOrm(tipoCultivo);
    const guardado = await this.ormRepository.save(orm);
    return TipoCultivoWikiMapper.toDomain(guardado);
  }

  async actualizar(id: number, tipoCultivo: TipoCultivoWiki): Promise<TipoCultivoWiki> {
    const orm = await this.ormRepository.preload({ ...TipoCultivoWikiMapper.toOrm(tipoCultivo), id });
    if (!orm) throw new NotFoundException(`No existe un tipo de cultivo con id ${id}`);
    const actualizado = await this.ormRepository.save(orm);
    return TipoCultivoWikiMapper.toDomain(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<TipoCultivoWiki | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? TipoCultivoWikiMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<TipoCultivoWiki[]> {
    const filas = await this.ormRepository.find();
    return filas.map(TipoCultivoWikiMapper.toDomain);
  }
}