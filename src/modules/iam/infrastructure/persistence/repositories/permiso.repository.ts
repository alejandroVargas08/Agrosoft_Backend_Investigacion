import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { Permiso } from '../../../domain/entities/permiso.entity';
import { PermisoOrmEntity } from '../entities/permiso.orm-entity';
import { PermisoMapper } from '../mappers/permiso.mapper';

@Injectable()
export class PermisoRepository implements PermisoRepositoryPort {
  constructor(
    @InjectRepository(PermisoOrmEntity)
    private readonly repo: Repository<PermisoOrmEntity>,
  ) {}

  async guardar(permiso: Permiso): Promise<Permiso> {
    const orm = PermisoMapper.aPersistencia(permiso);
    const guardado = await this.repo.save(orm);
    return PermisoMapper.aDominio(guardado);
  }

  async actualizar(permiso: Permiso): Promise<Permiso> {
    const orm = PermisoMapper.aPersistencia(permiso);
    await this.repo.save(orm);
    return permiso;
  }

  async buscarPorId(id: number): Promise<Permiso | null> {
    const orm = await this.repo.findOne({ where: { id }, withDeleted: true });
    return orm ? PermisoMapper.aDominio(orm) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Permiso | null> {
    const orm = await this.repo.findOne({ where: { nombre } });
    return orm ? PermisoMapper.aDominio(orm) : null;
  }

  async listarTodos(): Promise<Permiso[]> {
    const orms = await this.repo.find();
    return orms.map(PermisoMapper.aDominio);
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}