import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalisisVuelo } from '../../../domain/entities/analisis-vuelo.entity';
import type { AnalisisVueloRepositoryPort } from '../../../domain/ports/analisis-vuelo.repository.port';
import { AnalisisVueloOrmEntity } from '../entities/analisis-vuelo.orm-entity';
import { AnalisisVueloMapper } from '../mappers/analisis-vuelo.mapper';

@Injectable()
export class AnalisisVueloRepository implements AnalisisVueloRepositoryPort {
  constructor(
    @InjectRepository(AnalisisVueloOrmEntity)
    private readonly ormRepository: Repository<AnalisisVueloOrmEntity>,
  ) {}

  async guardar(analisis: AnalisisVuelo): Promise<AnalisisVuelo> {
    const guardado = await this.ormRepository.save(AnalisisVueloMapper.toOrm(analisis));
    const completo = await this.ormRepository.findOneByOrFail({ id: guardado.id });
    return AnalisisVueloMapper.toDomain(completo);
  }

  async buscarPorId(id: number): Promise<AnalisisVuelo | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? AnalisisVueloMapper.toDomain(orm) : null;
  }

  async listarPorVuelo(vueloId: number): Promise<AnalisisVuelo[]> {
    const filas = await this.ormRepository.find({ where: { vueloId }, order: { creadoEn: 'DESC' } });
    return filas.map(AnalisisVueloMapper.toDomain);
  }
}
