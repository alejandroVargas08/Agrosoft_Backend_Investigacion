import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoSensor } from '../../../domain/entities/tipo-sensor.entity';
import type { TipoSensorRepositoryPort } from '../../../domain/ports/tipo-sensor.repository.port';
import { TipoSensorOrmEntity } from '../entities/tipo-sensor.orm-entity';
import { TipoSensorMapper } from '../mappers/tipo-sensor.mapper';

@Injectable()
export class TipoSensorRepository implements TipoSensorRepositoryPort {
  constructor(
    @InjectRepository(TipoSensorOrmEntity)
    private readonly ormRepository: Repository<TipoSensorOrmEntity>,
  ) {}

  async guardar(tipoSensor: TipoSensor): Promise<TipoSensor> {
    const orm = TipoSensorMapper.toOrm(tipoSensor);
    const guardado = await this.ormRepository.save(orm);
    return TipoSensorMapper.toDomain(guardado);
  }

  async actualizar(id: number, tipoSensor: TipoSensor): Promise<TipoSensor> {
    const orm = await this.ormRepository.preload({ ...TipoSensorMapper.toOrm(tipoSensor), id });
    if (!orm) throw new NotFoundException(`No existe un tipo de sensor con id ${id}`);
    const actualizado = await this.ormRepository.save(orm);
    return TipoSensorMapper.toDomain(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<TipoSensor | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? TipoSensorMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<TipoSensor[]> {
    const filas = await this.ormRepository.find();
    return filas.map(TipoSensorMapper.toDomain);
  }
}