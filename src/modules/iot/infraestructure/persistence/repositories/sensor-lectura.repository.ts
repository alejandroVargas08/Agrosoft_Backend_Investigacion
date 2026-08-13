import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorLectura } from '../../../domain/entities/sensor-lectura.entity';
import type { SensorLecturaRepositoryPort } from '../../../domain/ports/sensor-lectura.repository.port';
import { SensorLecturaOrmEntity } from '../entities/sensor-lectura.orm-entity';
import { SensorLecturaMapper } from '../mappers/sensor-lectura.mapper';

@Injectable()
export class SensorLecturaRepository implements SensorLecturaRepositoryPort {
  constructor(
    @InjectRepository(SensorLecturaOrmEntity)
    private readonly ormRepository: Repository<SensorLecturaOrmEntity>,
  ) {}

  async guardar(lectura: SensorLectura): Promise<SensorLectura> {
    const orm = SensorLecturaMapper.toOrm(lectura);
    const guardado = await this.ormRepository.save(orm);
    return SensorLecturaMapper.toDomain(guardado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<SensorLectura | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? SensorLecturaMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<SensorLectura[]> {
    const filas = await this.ormRepository.find();
    return filas.map(SensorLecturaMapper.toDomain);
  }

  async listarPorSensorId(sensorId: number): Promise<SensorLectura[]> {
    const filas = await this.ormRepository.find({ where: { sensorId } });
    return filas.map(SensorLecturaMapper.toDomain);
  }
}