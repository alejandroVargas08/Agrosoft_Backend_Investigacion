import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Vuelo } from '../../../domain/entities/vuelo.entity';
import type { FiltrosVuelo, VueloRepositoryPort } from '../../../domain/ports/vuelo.repository.port';
import { VueloOrmEntity } from '../entities/vuelo.orm-entity';
import { VueloMapper } from '../mappers/vuelo.mapper';

@Injectable()
export class VueloRepository implements VueloRepositoryPort {
  constructor(
    @InjectRepository(VueloOrmEntity)
    private readonly ormRepository: Repository<VueloOrmEntity>,
  ) {}

  async guardar(vuelo: Vuelo): Promise<Vuelo> {
    const guardado = await this.ormRepository.save(VueloMapper.toOrm(vuelo));
    const completo = await this.ormRepository.findOneByOrFail({ id: guardado.id });
    return VueloMapper.toDomain(completo);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<Vuelo | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? VueloMapper.toDomain(orm) : null;
  }

  async listar(filtros: FiltrosVuelo = {}): Promise<Vuelo[]> {
    if (filtros.loteIds && filtros.loteIds.length === 0) return [];
    const filas = await this.ormRepository.find({
      where: {
        ...(filtros.loteId !== undefined && { loteId: filtros.loteId }),
        ...(filtros.loteId === undefined && filtros.loteIds && { loteId: In(filtros.loteIds) }),
        ...(filtros.dronId !== undefined && { dronId: filtros.dronId }),
      },
      order: { fechaVuelo: 'DESC' },
    });
    return filas.map(VueloMapper.toDomain);
  }
}
