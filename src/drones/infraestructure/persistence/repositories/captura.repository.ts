import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Captura } from '../../../domain/entities/captura.entity';
import type { CapturaRepositoryPort } from '../../../domain/ports/captura.repository.port';
import { CapturaOrmEntity } from '../entities/captura.orm-entity';
import { CapturaMapper } from '../mappers/captura.mapper';

@Injectable()
export class CapturaRepository implements CapturaRepositoryPort {
  constructor(
    @InjectRepository(CapturaOrmEntity)
    private readonly ormRepository: Repository<CapturaOrmEntity>,
  ) {}

  async guardarVarias(capturas: Captura[]): Promise<Captura[]> {
    if (capturas.length === 0) return [];
    const guardadas = await this.ormRepository.save(capturas.map(CapturaMapper.toOrm));
    return guardadas.map(CapturaMapper.toDomain);
  }

  async buscarPorClaves(vueloId: number, claves: string[]): Promise<Captura[]> {
    if (claves.length === 0) return [];
    const filas = await this.ormRepository.find({ where: { vueloId, claveCaptura: In(claves) } });
    return filas.map(CapturaMapper.toDomain);
  }

  async listarPorVuelo(vueloId: number): Promise<Captura[]> {
    const filas = await this.ormRepository.find({ where: { vueloId }, order: { claveCaptura: 'ASC' } });
    return filas.map(CapturaMapper.toDomain);
  }

  async contarPorVuelo(vueloId: number): Promise<number> {
    return this.ormRepository.countBy({ vueloId });
  }
}
