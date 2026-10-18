export interface AlcanceDatos {
  verTodo: boolean;
  programasPermitidos: number[];
}

export interface UsuarioAutenticado extends AlcanceDatos {
  id: number;
  correo: string;
  rolId: number;
  permisos: string[];
}

export const PERMISO_VER_TODAS_LAS_FICHAS = 'fichas.ver_todas';

export class ReglasAlcance {
  static puedeVerPrograma(alcance: AlcanceDatos, programaFormacionId: number | null): boolean {
    if (programaFormacionId === null) return true;
    if (alcance.verTodo) return true;
    return alcance.programasPermitidos.includes(programaFormacionId);
  }

  static puedeAsignarPrograma(alcance: AlcanceDatos, programaFormacionId: number | null): boolean {
    if (programaFormacionId === null) return true;
    return alcance.verTodo || alcance.programasPermitidos.includes(programaFormacionId);
  }
}
