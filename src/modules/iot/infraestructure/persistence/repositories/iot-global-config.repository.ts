import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IotGlobalConfigOrmEntity } from '../entities/iot-global-config.orm-entity';
import { IotGlobalConfigMapper } from '../mappers/iot-global-config.mapper';

@Injectable()
export class IotGlobalConfigRepository implements IotGlobalConfigRepositoryPort {
  constructor(
    @InjectRepository(IotGlobalConfigOrmEntity)
    private readonly ormRepository: Repository<IotGlobalConfigOrmEntity>,
  ) {}

  async guardar(config: IotGlobalConfig): Promise<IotGlobalConfig> {
    const orm = IotGlobalConfigMapper.toOrm(config);
    const guardado = await this.ormRepository.save(orm);
    return this.buscarPorId(guardado.id) as Promise<IotGlobalConfig>;
  }

  async actualizar(id: number, config: IotGlobalConfig): Promise<IotGlobalConfig> {
    await this.ormRepository.save({ ...IotGlobalConfigMapper.toOrm(config), id });
    return this.buscarPorId(id) as Promise<IotGlobalConfig>;
  }

  async eliminar(id: number): Promise<void> {
    await this.ormRepository.softDelete({ id });
  }

  async buscarPorId(id: number): Promise<IotGlobalConfig | null> {
    // select: ['contrasena'] es obligatorio aquí, porque en el ORM
    // marcamos esa columna como select: false por defecto
    const orm = await this.ormRepository
      .createQueryBuilder('config')
      .addSelect('config.contrasena')
      .where('config.id = :id', { id })
      .getOne();
    return orm ? IotGlobalConfigMapper.toDomain(orm) : null;
  }

  async listarTodos(): Promise<IotGlobalConfig[]> {
    const filas = await this.ormRepository
      .createQueryBuilder('config')
      .addSelect('config.contrasena')
      .getMany();
    return filas.map(IotGlobalConfigMapper.toDomain);
  }
}