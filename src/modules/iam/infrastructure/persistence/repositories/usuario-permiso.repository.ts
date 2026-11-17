import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioPermisoRepositoryPort } from '../../../domain/ports/usuario-permiso.repository.port';
import { UsuarioPermiso } from '../../../domain/entities/usuario-permiso.entity';
import { UsuarioPermisoOrmEntity } from '../entities/usuario-permiso.orm-entity';
import { UsuarioPermisoMapper } from '../mappers/usuario-permiso.mapper';

@Injectable()
export class UsuarioPermisoRepository implements UsuarioPermisoRepositoryPort {
  constructor(
    @InjectRepository(UsuarioPermisoOrmEntity)
    private readonly repo: Repository<UsuarioPermisoOrmEntity>,
  ) {}

  async guardar(usuarioPermiso: UsuarioPermiso): Promise<UsuarioPermiso> {
    const orm = UsuarioPermisoMapper.aPersistencia(usuarioPermiso);
    const guardado = await this.repo.save(orm);
    return UsuarioPermisoMapper.aDominio(guardado);
  }

  async buscarPorUsuarioId(usuarioId: number): Promise<UsuarioPermiso[]> {
    const orms = await this.repo.find({ where: { usuarioId } });
    return orms.map(UsuarioPermisoMapper.aDominio);
  }

  async buscarPorUsuarioYPermiso(
    usuarioId: number,
    permisoId: number,
  ): Promise<UsuarioPermiso | null> {
    const orm = await this.repo.findOne({ where: { usuarioId, permisoId } });
    return orm ? UsuarioPermisoMapper.aDominio(orm) : null;
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  async eliminarPorUsuarioYPermiso(
    usuarioId: number,
    permisoId: number,
  ): Promise<void> {
    await this.repo.softDelete({ usuarioId, permisoId });
  }
}