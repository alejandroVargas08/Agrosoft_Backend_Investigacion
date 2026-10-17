import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResultadoCaptura } from '../../../domain/entities/resultado-captura.entity';
import type { ResultadoCapturaRepositoryPort } from '../../../domain/ports/resultado-captura.repository.port';
import { ResultadoCapturaOrmEntity } from '../entities/resultado-captura.orm-entity';
import { ResultadoCapturaMapper } from '../mappers/resultado-captura.mapper';

@Injectable()
export class ResultadoCapturaRepository implements ResultadoCapturaRepositoryPort {
  constructor(
    @InjectRepository(ResultadoCapturaOrmEntity)
    private readonly ormRepository: Repository<ResultadoCapturaOrmEntity>,
  ) {}

  async guardar(resultado: ResultadoCaptura): Promise<ResultadoCaptura> {
    const guardado = await this.ormRepository.save(ResultadoCapturaMapper.toOrm(resultado));
    return ResultadoCapturaMapper.toDomain(guardado);
  }

  async listarPorAnalisis(analisisId: number, soloCriticas: boolean): Promise<ResultadoCaptura[]> {
    const filas = await this.ormRepository.find({
      where: { analisisId, ...(soloCriticas && { esCritica: true }) },
      order: { ndviPromedio: 'ASC' },
    });
    return filas.map(ResultadoCapturaMapper.toDomain);
  }
}
