import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { EstadoEvaluacion, EtapaEvaluacion, EvaluacionTerreno } from '../../../domain/entities/evaluacion-terreno.entity';
import { EvaluacionTerrenoRepositoryPort, FiltrosEvaluacion } from '../../../domain/ports/repositorios.port';
import { EvaluacionTerrenoOrmEntity } from '../entities/evaluacion-terreno.orm-entity';

@Injectable()
export class EvaluacionTerrenoRepository implements EvaluacionTerrenoRepositoryPort {
  constructor(
    @InjectRepository(EvaluacionTerrenoOrmEntity)
    private readonly repo: Repository<EvaluacionTerrenoOrmEntity>,
  ) {}

  async guardar(evaluacion: EvaluacionTerreno): Promise<EvaluacionTerreno> {
    const { id, creadoEn, actualizadoEn, ...props } = evaluacion.toProps();
    const guardada = await this.repo.save(this.repo.create({ ...props, ...(id ? { id } : {}) }));
    return this.aDominio(guardada);
  }

  async buscarPorId(id: number): Promise<EvaluacionTerreno | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? this.aDominio(orm) : null;
  }

  async listar(filtros: FiltrosEvaluacion): Promise<EvaluacionTerreno[]> {
    const { loteId, loteIdsVisibles, usuarioId } = filtros;
    let where: FindOptionsWhere<EvaluacionTerrenoOrmEntity>[];
    if (loteId) {
      const visible = loteIdsVisibles === null || loteIdsVisibles.includes(loteId);
      where = [visible ? { loteId } : { loteId, solicitadoPorUsuarioId: usuarioId }];
    } else if (loteIdsVisibles === null) {
      where = [{}];
    } else {
      where = [{ solicitadoPorUsuarioId: usuarioId }];
      if (loteIdsVisibles.length > 0) where.push({ loteId: In(loteIdsVisibles) });
    }
    const lista = await this.repo.find({ where, order: { creadoEn: 'DESC' }, take: 100 });
    return lista.map((orm) => this.aDominio(orm));
  }

  private aDominio(orm: EvaluacionTerrenoOrmEntity): EvaluacionTerreno {
    return EvaluacionTerreno.desdePersistencia({
      id: orm.id,
      loteId: orm.loteId,
      vueloId: orm.vueloId ?? null,
      areaDelVuelo: orm.areaDelVuelo ?? false,
      nombre: orm.nombre,
      poligono: orm.poligono,
      cultivoPreferido: orm.cultivoPreferido,
      usarDron: orm.usarDron,
      usarSatelite: orm.usarSatelite,
      estado: orm.estado as EstadoEvaluacion,
      etapa: orm.etapa as EtapaEvaluacion | null,
      perfil: orm.perfil,
      ranking: orm.ranking,
      disenos: orm.disenos,
      advertencias: orm.advertencias ?? [],
      mensajeError: orm.mensajeError,
      solicitadoPorUsuarioId: orm.solicitadoPorUsuarioId,
      finalizadoEn: orm.finalizadoEn,
      creadoEn: orm.creadoEn,
      actualizadoEn: orm.actualizadoEn,
    });
  }
}
