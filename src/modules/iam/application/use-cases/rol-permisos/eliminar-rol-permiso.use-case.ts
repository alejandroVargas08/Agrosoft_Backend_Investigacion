import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RolPermisoRepositoryPort } from '../../../domain/ports/rol-permiso.repository.port';
import { ROL_PERMISO_REPOSITORY } from '../../../domain/ports/rol-permiso.repository.token';
import type { PermisoRepositoryPort } from '../../../domain/ports/permiso.repository.port';
import { PERMISO_REPOSITORY } from '../../../domain/ports/permiso.repository.token';

/** Se declara aquí para no importar nada de infrastructure desde application. */
const PERMISO_GESTIONAR_USUARIOS = 'usuarios.gestionar';

@Injectable()
export class EliminarRolPermisoUseCase {
  constructor(
    @Inject(ROL_PERMISO_REPOSITORY)
    private readonly repository: RolPermisoRepositoryPort,
    @Inject(PERMISO_REPOSITORY)
    private readonly permisos: PermisoRepositoryPort,
  ) {}

  /**
   * @param rolDelSolicitante el rol de quien pide el cambio. Sirve para no
   *   dejar que un administrador se quite a sí mismo el permiso de
   *   administrar usuarios: si lo hiciera perdería el acceso a la pantalla
   *   que es el único sitio desde donde podría devolvérselo.
   */
  async ejecutar(rolId: number, permisoId: number, rolDelSolicitante?: number): Promise<void> {
    const existente = await this.repository.buscarPorRolYPermiso(rolId, permisoId);
    if (!existente) throw new NotFoundException('La relación rol-permiso no existe');

    if (rolDelSolicitante !== undefined && rolDelSolicitante === rolId) {
      const permiso = await this.permisos.buscarPorId(permisoId);
      if (permiso?.obtenerNombre() === PERMISO_GESTIONAR_USUARIOS) {
        throw new BadRequestException(
          'No puedes quitarle a tu propio rol el permiso de administrar usuarios: perderías el acceso para devolvértelo. Pídeselo a otro administrador.',
        );
      }
    }

    await this.repository.eliminar(rolId, permisoId);
  }
}
