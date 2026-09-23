import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIARepositoryPort } from '../../domain/ports/conversacion-ia.repository.port';
import { ConversacionIA } from '../../domain/entities/conversacion-ia.entity';
import { ConversacionIAOrmEntity } from './conversacion-ia.orm-entity';

@Injectable()
export class ConversacionIARepository implements ConversacionIARepositoryPort {
  constructor(
    @InjectRepository(ConversacionIAOrmEntity)
    private readonly repo: Repository<ConversacionIAOrmEntity>,
  ) {}

  async crear(usuarioId: number, titulo: string): Promise<ConversacionIA> {
    const guardado = await this.repo.save(this.repo.create({ usuarioId, titulo }));
    return this.aDominio(guardado);
  }

  async listarPorUsuario(usuarioId: number): Promise<ConversacionIA[]> {
    const registros = await this.repo.find({
      where: { usuarioId },
      order: { actualizadoEn: 'DESC' },
    });
    return registros.map((r) => this.aDominio(r));
  }

  async buscarPorId(id: number): Promise<ConversacionIA | null> {
    const registro = await this.repo.findOneBy({ id });
    return registro ? this.aDominio(registro) : null;
  }

  async guardar(conversacion: ConversacionIA): Promise<void> {
    await this.repo.save({
      id: conversacion.obtenerId(),
      usuarioId: conversacion.obtenerUsuarioId(),
      titulo: conversacion.obtenerTitulo(),
      actualizadoEn: conversacion.obtenerActualizadoEn(),
    });
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private aDominio(r: ConversacionIAOrmEntity): ConversacionIA {
    return ConversacionIA.reconstruir({
      id: r.id, 
      usuarioId: r.usuarioId, 
      titulo: r.titulo,
      creadoEn: r.creadoEn, 
      actualizadoEn: r.actualizadoEn,
    });
  }
}