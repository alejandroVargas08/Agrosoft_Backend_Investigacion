import { ProgramaFormacion } from '../entities/programa-formacion.entity';

export interface NuevoProgramaFormacion {
  nombre: string;
  tipo: string;
  ficha: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
}

export interface ProgramaFormacionRepositoryPort {
  buscarPorId(id: number): Promise<ProgramaFormacion | null>;
  buscarPorFicha(ficha: string): Promise<ProgramaFormacion | null>;
  obtenerTodos(): Promise<ProgramaFormacion[]>;
  guardar(datos: NuevoProgramaFormacion): Promise<ProgramaFormacion>;
}
