import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { Rol } from '../../../domain/entities/rol.entity';
import { RolOrmEntity } from '../entities/rol.orm-entity';
import { RolMapper } from '../mappers/rol.mapper';

@Injectable()
export class RolRepository implements RolRepositoryPort {
  constructor(
    @InjectRepository(RolOrmEntity)
    private readonly repo: Repository<RolOrmEntity>,
  ) {}

  async guardar(rol: Rol): Promise<Rol> {
    const orm = RolMapper.aPersistencia(rol);
    const guardado = await this.repo.save(orm);
    return RolMapper.aDominio(guardado);
  }

  async actualizar(rol: Rol): Promise<Rol> {
    const orm = RolMapper.aPersistencia(rol);
    await this.repo.save(orm);
    return rol;
  }

  async buscarPorId(id: number): Promise<Rol | null> {
    const orm = await this.repo.findOne({ where: { id }, withDeleted: true });
    return orm ? RolMapper.aDominio(orm) : null;
  }

  async buscarPorNombre(nombre: string): Promise<Rol | null> {
    const orm = await this.repo.findOne({ where: { nombre } });
    return orm ? RolMapper.aDominio(orm) : null;
  }

  async listarTodos(): Promise<Rol[]> {
    const orms = await this.repo.find();
    return orms.map(RolMapper.aDominio);
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }
}