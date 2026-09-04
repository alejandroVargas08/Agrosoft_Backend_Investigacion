import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RolPermisoRepositoryPort } from '../../../domain/ports/rol-permiso.repository.port';
import { RolPermiso } from '../../../domain/entities/rol-permiso.entity';
import { RolPermisoOrmEntity } from '../entities/rol-permiso.orm-entity';
import { RolPermisoMapper } from '../mappers/rol-permiso.mapper';

@Injectable()
export class RolPermisoRepository implements RolPermisoRepositoryPort {
  constructor(
    @InjectRepository(RolPermisoOrmEntity)
    private readonly repo: Repository<RolPermisoOrmEntity>,
  ) {}

  async guardar(rolPermiso: RolPermiso): Promise<RolPermiso> {
    const orm = RolPermisoMapper.aPersistencia(rolPermiso);
    const guardado = await this.repo.save(orm);
    return RolPermisoMapper.aDominio(guardado);
  }

  async buscarPorRolId(rolId: number): Promise<RolPermiso[]> {
    const orms = await this.repo.find({ where: { rolId } });
    return orms.map(RolPermisoMapper.aDominio);
  }

  async buscarPorRolYPermiso(rolId: number, permisoId: number): Promise<RolPermiso | null> {
    const orm = await this.repo.findOne({ where: { rolId, permisoId } });
    return orm ? RolPermisoMapper.aDominio(orm) : null;
  }

  async eliminar(rolId: number, permisoId: number): Promise<void> {
    await this.repo.softDelete({ rolId, permisoId });
  }
}