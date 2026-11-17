import { ProgramaFormacion } from '../../../domain/entities/programa-formacion.entity';

export interface ProgramaFormacionRespuesta {
  id: number;
  nombre: string;
  tipo: string;
  ficha: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
}

export function aProgramaRespuesta(programa: ProgramaFormacion): ProgramaFormacionRespuesta {
  return {
    id: programa.obtenerId(),
    nombre: programa.obtenerNombre(),
    tipo: programa.obtenerTipo(),
    ficha: programa.obtenerFicha(),
    fechaInicio: programa.obtenerFechaInicio(),
    fechaFin: programa.obtenerFechaFin(),
    estado: programa.obtenerEstado(),
  };
}
