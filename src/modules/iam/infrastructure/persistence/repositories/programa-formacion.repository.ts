import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramaFormacionOrmEntity } from '../entities/programa-formacion.orm-entity';
import { NuevoProgramaFormacion, ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { ProgramaFormacion } from '../../../domain/entities/programa-formacion.entity';

@Injectable()
export class ProgramaFormacionRepository implements ProgramaFormacionRepositoryPort {
  constructor(
    @InjectRepository(ProgramaFormacionOrmEntity)
    private readonly repo: Repository<ProgramaFormacionOrmEntity>,
  ) {}

  async buscarPorId(id: number): Promise<ProgramaFormacion | null> {
    const registro = await this.repo.findOneBy({ id });
    return registro ? this.aDominio(registro) : null;
  }

  async buscarPorFicha(ficha: string): Promise<ProgramaFormacion | null> {
    const registro = await this.repo.findOneBy({ ficha });
    return registro ? this.aDominio(registro) : null;
  }

  async obtenerTodos(): Promise<ProgramaFormacion[]> {
    const registros = await this.repo.find({ order: { nombre: 'ASC', ficha: 'ASC' } });
    return registros.map((registro) => this.aDominio(registro));
  }

  async guardar(datos: NuevoProgramaFormacion): Promise<ProgramaFormacion> {
    const guardado = await this.repo.save(this.repo.create(datos));
    return this.aDominio(guardado);
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
