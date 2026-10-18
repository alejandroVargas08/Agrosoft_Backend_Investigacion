import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UsuarioProgramaRepositoryPort } from '../../../domain/ports/usuario-programa.repository.port';
import { UsuarioProgramaOrmEntity } from '../entities/usuario-programa.orm-entity';

@Injectable()
export class UsuarioProgramaRepository implements UsuarioProgramaRepositoryPort {
  constructor(
    @InjectRepository(UsuarioProgramaOrmEntity)
    private readonly repo: Repository<UsuarioProgramaOrmEntity>,
  ) {}

  async asignar(usuarioId: number, programaFormacionId: number): Promise<void> {
    await this.repo.save(this.repo.create({ usuarioId, programaFormacionId }));
  }

  async quitar(usuarioId: number, programaFormacionId: number): Promise<void> {
    await this.repo.delete({ usuarioId, programaFormacionId });
  }

  async listarProgramasDeUsuario(usuarioId: number): Promise<number[]> {
    const filas = await this.repo.find({ where: { usuarioId }, order: { programaFormacionId: 'ASC' } });
    return filas.map((fila) => fila.programaFormacionId);
  }

  async existe(usuarioId: number, programaFormacionId: number): Promise<boolean> {
    return (await this.repo.count({ where: { usuarioId, programaFormacionId } })) > 0;
  }
}
