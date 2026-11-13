import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CultivoAptitud } from '../../../domain/entities/cultivo-aptitud.entity';
import { CultivoAptitudRepositoryPort } from '../../../domain/ports/repositorios.port';
import { CultivoAptitudOrmEntity } from '../entities/cultivo-aptitud.orm-entity';
import { CATALOGO_CULTIVOS } from '../catalogo-cultivos';

@Injectable()
export class CultivoAptitudRepository implements CultivoAptitudRepositoryPort, OnModuleInit {
  private readonly logger = new Logger(CultivoAptitudRepository.name);

  constructor(
    @InjectRepository(CultivoAptitudOrmEntity)
    private readonly repo: Repository<CultivoAptitudOrmEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    const existentes = new Set((await this.repo.find({ select: { codigo: true } })).map((c) => c.codigo));
    const nuevos = CATALOGO_CULTIVOS.filter((c) => !existentes.has(c.codigo)).map((c) => CultivoAptitud.crear(c).toProps());
    if (nuevos.length === 0) return;
    await this.repo.save(nuevos.map(({ id, ...props }) => this.repo.create(props)));
    this.logger.log(`Catálogo de aptitud: ${nuevos.length} cultivos agregados`);
  }

  async listarActivos(): Promise<CultivoAptitud[]> {
    const lista = await this.repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    return lista.map((orm) => this.aDominio(orm));
  }

  async buscarPorCodigo(codigo: string): Promise<CultivoAptitud | null> {
    const orm = await this.repo.findOne({ where: { codigo, activo: true } });
    return orm ? this.aDominio(orm) : null;
  }

  private aDominio(orm: CultivoAptitudOrmEntity): CultivoAptitud {
    const { creadoEn, actualizadoEn, ...props } = orm;
    return CultivoAptitud.desdePersistencia(props);
  }
}
