import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { UsuarioOrmEntity } from '../entities/usuario.orm-entity';
import { UsuarioMapper } from '../mappers/usuario.mapper';

@Injectable()
export class UsuarioRepository implements UsuarioRepositoryPort {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {}

  async obtenerTodos(): Promise<Usuario[]> {
    const usuariosOrm = await this.repo.find();
    return usuariosOrm.map((orm) => UsuarioMapper.aDominio(orm));
  }

  async guardar(usuario: Usuario): Promise<Usuario> {
    const orm = UsuarioMapper.aPersistencia(usuario);
    const guardado = await this.repo.save(orm);
    return UsuarioMapper.aDominio(guardado);
  }

  async actualizar(usuario: Usuario): Promise<Usuario> {
    const orm = UsuarioMapper.aPersistencia(usuario);
    await this.repo.save(orm);
    return usuario;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? UsuarioMapper.aDominio(orm) : null;
  }

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const orm = await this.repo.findOne({ where: { correo } });
    return orm ? UsuarioMapper.aDominio(orm) : null;
  }

  async buscarPorIdentificacion(identificacion: string): Promise<Usuario | null> {
    const orm = await this.repo.findOne({ where: { identificacion } });
    return orm ? UsuarioMapper.aDominio(orm) : null;
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}