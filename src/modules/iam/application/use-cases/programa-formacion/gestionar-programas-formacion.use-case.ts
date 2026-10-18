import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { AlcanceDatos } from '../../../domain/value-objects/alcance-datos.vo';
import { CrearProgramaFormacionDto } from '../../dto/programa-formacion/crear-programa-formacion.dto';
import { aProgramaRespuesta, ProgramaFormacionRespuesta } from '../../dto/programa-formacion/programa-formacion.respuesta';

@Injectable()
export class GestionarProgramasFormacionUseCase {
  constructor(
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly repo: ProgramaFormacionRepositoryPort,
  ) {}

  async listarActivos(): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas.filter((programa) => programa.obtenerEstado() === 'activo').map(aProgramaRespuesta);
  }

  async listarTodos(): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas.map(aProgramaRespuesta);
  }

  async listarAsignables(alcance: AlcanceDatos): Promise<ProgramaFormacionRespuesta[]> {
    const programas = await this.repo.obtenerTodos();
    return programas
      .filter((programa) => alcance.verTodo || alcance.programasPermitidos.includes(programa.obtenerId()))
      .map(aProgramaRespuesta);
  }

  async crear(dto: CrearProgramaFormacionDto): Promise<ProgramaFormacionRespuesta> {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    if (await this.repo.buscarPorFicha(dto.ficha.trim())) {
      throw new ConflictException(`Ya existe la ficha ${dto.ficha}`);
    }
    const programa = await this.repo.guardar({
      nombre: dto.nombre.trim(),
      tipo: dto.tipo.trim(),
      ficha: dto.ficha.trim(),
      fechaInicio,
      fechaFin,
      estado: dto.estado ?? 'activo',
    });
    return aProgramaRespuesta(programa);
  }
}
