import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';

export type FuenteContexto =
  | 'tareas'
  | 'cultivos'
  | 'sensores'
  | 'incidencias'
  | 'inventario'
  | 'drones'
  | 'finanzas'
  | 'usuarios'
  | 'plagas';

export const FUENTES: FuenteContexto[] = ['tareas', 'cultivos', 'sensores', 'incidencias', 'inventario', 'drones', 'finanzas', 'usuarios', 'plagas'];

export interface ProveedorContextoPort {
  readonly fuente: FuenteContexto;
  obtener(usuario: UsuarioAutenticado): Promise<string>;
}

export const PERMISOS_POR_FUENTE: Record<FuenteContexto, string[]> = {
  tareas: ['actividades.ver', 'actividades.ejecutar', 'actividades.revisar', 'actividades.asignar'],
  cultivos: ['cultivos.ver', 'lotes.ver'],
  sensores: ['sensores.ver'],
  incidencias: ['incidencias.ver'],
  inventario: ['inventario.ver'],
  drones: ['vuelos.ver'],
  // 'finanzas.ver' no existe entre los 25 permisos del seeder; mientras se crea,
  // finanzas queda para administradores (usuarios.gestionar) e instructores (actividades.asignar).
  finanzas: ['finanzas.ver', 'usuarios.gestionar', 'actividades.asignar'],
  usuarios: ['usuarios.gestionar'],
  plagas: ['incidencias.ver'],
};

export const NOMBRE_FUENTE: Record<FuenteContexto, string> = {
  tareas: 'tareas y actividades',
  cultivos: 'lotes y cultivos',
  sensores: 'sensores IoT',
  incidencias: 'incidencias y plagas',
  inventario: 'inventario',
  drones: 'vuelos de dron',
  finanzas: 'finanzas',
  usuarios: 'usuarios y solicitudes de registro',
  plagas: 'la Wiki EPA (plagas, enfermedades y arvenses)',
};

export function tieneAcceso(usuario: UsuarioAutenticado, fuente: FuenteContexto): boolean {
  return PERMISOS_POR_FUENTE[fuente].some((permiso) => usuario.permisos.includes(permiso));
}

export function mensajeSinAcceso(fuente: FuenteContexto): string {
  return `Tu rol no tiene acceso a la información de ${NOMBRE_FUENTE[fuente]}.`;
}

export const PROVEEDORES_CONTEXTO_TOKEN = 'PROVEEDORES_CONTEXTO_TOKEN';
