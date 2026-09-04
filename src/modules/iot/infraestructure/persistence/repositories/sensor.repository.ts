import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../../../domain/entities/sensor.entity';
import { SensorRepositoryPort } from '../../../domain/ports/sensor.repository.port';
import { SensorOrmEntity } from '../entities/sensor.orm-entity';
import { SensorMapper } from '../mappers/sensor.mapper';

@Injectable()
export class SensorRepository implements SensorRepositoryPort {
  constructor(
    @InjectRepository(SensorOrmEntity)
    private readonly ormRepository: Repository<SensorOrmEntity>,
  ) {}

  async guardar(sensor: Sensor): Promise<Sensor> {
    const orm = SensorMapper.toOrm(sensor);
    const guardado = await this.ormRepository.save(orm);
    return SensorMapper.toDomain(guardado);
  }

  async actualizar(id: number, sensor: Sensor): Promise<Sensor> {
    const orm = await this.ormRepository.preload({ ...SensorMapper.toOrm(sensor), id });
    if (!orm) throw new NotFoundException(`No existe un sensor con id ${id}`);
    const actualizado = await this.ormRepository.save(orm);
    return SensorMapper.toDomain(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<Sensor | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? SensorMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<Sensor[]> {
    const filas = await this.ormRepository.find();
    return filas.map(SensorMapper.toDomain);
  }
}