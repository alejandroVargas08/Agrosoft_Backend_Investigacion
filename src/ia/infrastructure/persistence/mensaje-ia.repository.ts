import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensajeIARepositoryPort } from '../../domain/ports/mensaje-ia.repository.port';
import { MensajeIA, RolMensajeIA } from '../../domain/entities/mensaje-ia.entity';
import { MensajeIAOrmEntity } from './mensaje-ia.orm-entity';

@Injectable()
export class MensajeIARepository implements MensajeIARepositoryPort {
  constructor(
    @InjectRepository(MensajeIAOrmEntity)
    private readonly repo: Repository<MensajeIAOrmEntity>,
  ) {}

  async crear(props: {
    conversacionId: number; 
    rol: RolMensajeIA; 
    contenido: string;
    tieneImagenes?: boolean; 
    cantidadImagenes?: number;
  }): Promise<MensajeIA> {
    const guardado = await this.repo.save(this.repo.create({
      conversacionId: props.conversacionId,
      rol: props.rol,
      contenido: props.contenido,
      tieneImagenes: props.tieneImagenes ?? false,
      cantidadImagenes: props.cantidadImagenes ?? 0,
    }));
    return this.aDominio(guardado);
  }

  async listarPorConversacion(conversacionId: number): Promise<MensajeIA[]> {
    const registros = await this.repo.find({
      where: { conversacionId },
      order: { creadoEn: 'ASC' },
    });
    return registros.map((r) => this.aDominio(r));
  }

  private aDominio(r: MensajeIAOrmEntity): MensajeIA {
    return MensajeIA.reconstruir({
      id: r.id, 
      conversacionId: r.conversacionId, 
      rol: r.rol, 
      contenido: r.contenido,
      tieneImagenes: r.tieneImagenes, 
      cantidadImagenes: r.cantidadImagenes, 
      creadoEn: r.creadoEn,
    });
  }
}