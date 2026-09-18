import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramaFormacionOrmEntity } from '../entities/programa-formacion.orm-entity';
import { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { ProgramaFormacion } from '../../../domain/entities/programa-formacion.entity';

@Injectable()
export class ProgramaFormacionRepository implements ProgramaFormacionRepositoryPort {
  constructor(
    @InjectRepository(ProgramaFormacionOrmEntity)
    private readonly repo: Repository<ProgramaFormacionOrmEntity>,
  ) {}

  async buscarPorId(id: number): Promise<ProgramaFormacion | null> {
    const registro = await this.repo.findOneBy({ id });
    if (!registro) return null;
    return this.aDominio(registro);
  }

  async obtenerTodos(): Promise<ProgramaFormacion[]> {
    const registros = await this.repo.find();
    return registros.map(this.aDominio);
  }

  private aDominio(registro: ProgramaFormacionOrmEntity): ProgramaFormacion {
    return ProgramaFormacion.crear({
      id: registro.id,
      nombre: registro.nombre,
      tipo: registro.tipo,
      ficha: registro.ficha,
      fechaInicio: registro.fechaInicio,
      fechaFin: registro.fechaFin,
      estado: registro.estado,
    });
  }
}