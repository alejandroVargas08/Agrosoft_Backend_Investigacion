import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EpaTipoCultivoWiki } from '../../../domain/entities/epa-tipo-cultivo-wiki.entity';
import type { EpaTipoCultivoWikiRepositoryPort } from '../../../domain/ports/epa-tipo-cultivo-wiki.repository.port';
import { EpaTipoCultivoWikiOrmEntity } from '../entities/epa-tipo-cultivo-wiki.orm-entity';
import { EpaTipoCultivoWikiMapper } from '../mappers/epa-tipo-cultivo-wiki.mapper';

@Injectable()
export class EpaTipoCultivoWikiRepository implements EpaTipoCultivoWikiRepositoryPort {
  constructor(
    @InjectRepository(EpaTipoCultivoWikiOrmEntity)
    private readonly ormRepository: Repository<EpaTipoCultivoWikiOrmEntity>,
  ) {}

  async asociar(relacion: EpaTipoCultivoWiki): Promise<EpaTipoCultivoWiki> {
    const orm = EpaTipoCultivoWikiMapper.toOrm(relacion);
    const guardado = await this.ormRepository.save(orm);
    return EpaTipoCultivoWikiMapper.toDomain(guardado);
  }

  async desasociar(epaId: number, tipoCultivoWikiId: number): Promise<void> {
    await this.ormRepository.delete({ epaId, tipoCultivoWikiId });
  }

  async existeRelacion(epaId: number, tipoCultivoWikiId: number): Promise<boolean> {
    const count = await this.ormRepository.count({ where: { epaId, tipoCultivoWikiId } });
    return count > 0;
  }

  async listarTiposCultivoPorEpa(epaId: number): Promise<EpaTipoCultivoWiki[]> {
    const filas = await this.ormRepository.find({ where: { epaId } });
    return filas.map(EpaTipoCultivoWikiMapper.toDomain);
  }

  async listarEpasPorTipoCultivo(tipoCultivoWikiId: number): Promise<EpaTipoCultivoWiki[]> {
    const filas = await this.ormRepository.find({ where: { tipoCultivoWikiId } });
    return filas.map(EpaTipoCultivoWikiMapper.toDomain);
  }
}