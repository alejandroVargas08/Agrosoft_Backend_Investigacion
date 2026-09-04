import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorAlerta } from '../../../domain/entities/sensor-alerta.entity';
import type { SensorAlertaRepositoryPort } from '../../../domain/ports/sensor-alerta.repository.port';
import { SensorAlertaOrmEntity } from '../entities/sensor-alerta.orm-entity';
import { SensorAlertaMapper } from '../mappers/sensor-alerta.mapper';

@Injectable()
export class SensorAlertaRepository implements SensorAlertaRepositoryPort {
  constructor(
    @InjectRepository(SensorAlertaOrmEntity)
    private readonly ormRepository: Repository<SensorAlertaOrmEntity>,
  ) {}

  async guardar(alerta: SensorAlerta): Promise<SensorAlerta> {
    const orm = SensorAlertaMapper.toOrm(alerta);
    const guardado = await this.ormRepository.save(orm);
    return SensorAlertaMapper.toDomain(guardado);
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<SensorAlerta | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? SensorAlertaMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<SensorAlerta[]> {
    const filas = await this.ormRepository.find();
    return filas.map(SensorAlertaMapper.toDomain);
  }

  async listarPorSensorId(sensorId: number): Promise<SensorAlerta[]> {
    const filas = await this.ormRepository.find({ where: { sensorId } });
    return filas.map(SensorAlertaMapper.toDomain);
  }
}