import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Deja la base lista con los 3 roles y los permisos que pide el backend, para
 * que una instalacion nueva no arranque con el menu vacio. Reemplaza tener que
 * correr a mano los seeds 04, 07, 09, 11 y 12.
 *
 * Nunca quita nada y respeta lo que el administrador cambie:
 *  - crea solo los roles y permisos que no existen;
 *  - a un rol le pone sus permisos solo si el rol es nuevo o no tiene ninguno;
 *  - un permiso nuevo se le da a los roles que lo deben tener.
 * Si un administrador le quito un permiso a un rol, no se lo vuelve a poner.
 *
 * Se apaga con IAM_SEMILLA=false.
 */
const PERMISOS: ReadonlyArray<[nombre: string, descripcion: string]> = [
  ['usuarios.gestionar', 'Administrar usuarios, roles, permisos y fichas'],
  ['fichas.ver_todas', 'Ver todas las fichas, no solo las propias'],
  ['lotes.ver', 'Consultar lotes y sublotes'],
  ['lotes.gestionar', 'Crear y editar lotes y sublotes'],
  ['cultivos.ver', 'Consultar cultivos'],
  ['cultivos.gestionar', 'Crear y editar cultivos'],
  ['actividades.ver', 'Consultar actividades'],
  ['actividades.gestionar', 'Crear y editar actividades'],
  ['actividades.asignar', 'Asignar tareas a aprendices y ver sus fichas'],
  ['actividades.revisar', 'Aprobar y devolver entregas'],
  ['actividades.ejecutar', 'Iniciar y entregar sus propias tareas'],
  ['incidencias.ver', 'Consultar incidencias y tratamientos'],
  ['incidencias.gestionar', 'Registrar incidencias y tratamientos'],
  ['drones.ver', 'Consultar drones'],
  ['drones.gestionar', 'Crear y editar drones'],
  ['vuelos.ver', 'Consultar vuelos y sus analisis'],
  ['vuelos.gestionar', 'Programar y editar vuelos'],
  ['vuelos.cargar_imagenes', 'Subir imagenes de un vuelo'],
  ['analisis.solicitar', 'Pedir el analisis de un vuelo'],
  ['sensores.ver', 'Consultar sensores y sus lecturas'],
  ['sensores.gestionar', 'Registrar, editar rangos y borrar sensores'],
  ['inventario.ver', 'Consultar insumos, almacenes y movimientos'],
  ['inventario.gestionar', 'Registrar insumos, almacenes y movimientos'],
  ['terreno.ver', 'Consultar las evaluaciones y el diseño del terreno'],
  ['terreno.evaluar', 'Evaluar el terreno de un lote y diseñar la siembra'],
];

const TODOS = PERMISOS.map(([nombre]) => nombre);

const ROLES: ReadonlyArray<{ nombre: string; descripcion: string; permisos: readonly string[] }> = [
  { nombre: 'Administrador', descripcion: 'Acceso total al sistema', permisos: TODOS },
  {
    nombre: 'Instructor',
    descripcion: 'Asigna tareas, revisa entregas y atiende novedades',
    permisos: [
      'actividades.asignar', 'actividades.gestionar', 'actividades.revisar', 'actividades.ver',
      'analisis.solicitar', 'cultivos.gestionar', 'cultivos.ver', 'drones.ver',
      'incidencias.gestionar', 'incidencias.ver', 'inventario.gestionar', 'inventario.ver',
      'lotes.ver', 'sensores.gestionar', 'sensores.ver', 'terreno.evaluar', 'terreno.ver', 'vuelos.ver',
    ],
  },
  {
    nombre: 'Aprendiz',
    descripcion: 'Ejecuta sus tareas y reporta novedades',
    permisos: [
      'actividades.ejecutar', 'actividades.ver', 'cultivos.ver', 'drones.ver', 'incidencias.gestionar',
      'incidencias.ver', 'inventario.ver', 'lotes.ver', 'sensores.ver', 'terreno.ver', 'vuelos.ver',
    ],
  },
];

@Injectable()
export class SemillaIamService implements OnApplicationBootstrap {
  private readonly logger = new Logger('SemillaIam');

  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.IAM_SEMILLA === 'false') return;
    try {
      const resumen = await this.sembrar();
      if (resumen) this.logger.log(resumen);
    } catch (error) {
      // Nunca tumba el arranque: en el peor caso quedan los seeds manuales
      this.logger.error(`No se pudieron revisar los roles y permisos: ${(error as Error).message}`);
    }
  }

  private async sembrar(): Promise<string | null> {
    return this.db.transaction(async (m) => {
      const permisosNuevos = new Set<string>();
      for (const [nombre, descripcion] of PERMISOS) {
        const filas: { nombre: string }[] = await m.query(
          `INSERT INTO permisos (nombre, descripcion, estado) VALUES ($1, $2, 'activo')
           ON CONFLICT (nombre) DO NOTHING RETURNING nombre`,
          [nombre, descripcion],
        );
        if (filas.length) permisosNuevos.add(nombre);
      }

      const rolesNuevos: string[] = [];
      let enlaces = 0;
      for (const rol of ROLES) {
        const creado: unknown[] = await m.query(
          `INSERT INTO roles (nombre, descripcion, es_sistema, estado) VALUES ($1, $2, true, 'activo')
           ON CONFLICT (nombre) DO NOTHING RETURNING id`,
          [rol.nombre, rol.descripcion],
        );
        if (creado.length) rolesNuevos.push(rol.nombre);

        const [{ id: rolId, total }] = await m.query(
          `SELECT r.id, (SELECT COUNT(*) FROM rol_permisos rp WHERE rp.rol_id = r.id)::int AS total
           FROM roles r WHERE r.nombre = $1`,
          [rol.nombre],
        );
        const completo = creado.length > 0 || total === 0;
        const aDar = completo ? rol.permisos : rol.permisos.filter((p) => permisosNuevos.has(p));
        if (!aDar.length) continue;

        const insertados: unknown[] = await m.query(
          `INSERT INTO rol_permisos (rol_id, permiso_id)
           SELECT $1, p.id FROM permisos p
           WHERE p.nombre = ANY($2::text[])
             AND NOT EXISTS (SELECT 1 FROM rol_permisos rp WHERE rp.rol_id = $1 AND rp.permiso_id = p.id)
           RETURNING rol_id`,
          [rolId, aDar],
        );
        enlaces += insertados.length;
      }

      if (!permisosNuevos.size && !rolesNuevos.length && !enlaces) return null;
      return (
        `Roles y permisos al dia: ${permisosNuevos.size} permisos nuevos, ` +
        `${rolesNuevos.length} roles nuevos${rolesNuevos.length ? ' (' + rolesNuevos.join(', ') + ')' : ''}, ` +
        `${enlaces} permisos repartidos`
      );
    });
  }
}
