import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';

export type FuenteContexto =
  | 'tareas'
  | 'cultivos'
  | 'sensores'
  | 'incidencias'
  | 'inventario'
  | 'drones'
  | 'finanzas'
  | 'usuarios';

export const FUENTES: FuenteContexto[] = ['tareas', 'cultivos', 'sensores', 'incidencias', 'inventario', 'drones', 'finanzas', 'usuarios'];

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
  finanzas: ['finanzas.ver'],
  usuarios: ['usuarios.gestionar'],
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
};

export function tieneAcceso(usuario: UsuarioAutenticado, fuente: FuenteContexto): boolean {
  return PERMISOS_POR_FUENTE[fuente].some((permiso) => usuario.permisos.includes(permiso));
}

export function mensajeSinAcceso(fuente: FuenteContexto): string {
  return `Tu rol no tiene acceso a la información de ${NOMBRE_FUENTE[fuente]}.`;
}

export const PROVEEDORES_CONTEXTO_TOKEN = 'PROVEEDORES_CONTEXTO_TOKEN';
