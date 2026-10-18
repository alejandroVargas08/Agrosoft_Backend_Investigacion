import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ContextoAccesoPort } from '../../../domain/ports/contexto-acceso.port';
import { CONTEXTO_ACCESO_TOKEN } from '../../../domain/ports/contexto-acceso.token';
import { UsuarioAutenticado } from '../../../domain/value-objects/alcance-datos.vo';
import { PERMISOS_REQUERIDOS } from '../decorators/requiere-permisos.decorator';

interface SolicitudAutenticada {
  user?: { id?: number };
  usuarioAutenticado?: UsuarioAutenticado;
}

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CONTEXTO_ACCESO_TOKEN)
    private readonly contextoAcceso: ContextoAccesoPort,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const solicitud = contexto.switchToHttp().getRequest<SolicitudAutenticada>();
    const usuarioId = solicitud.user?.id;
    if (!usuarioId) throw new UnauthorizedException();

    const usuario = await this.contextoAcceso.obtener(usuarioId);
    if (!usuario) throw new UnauthorizedException('El usuario no existe o no está activo');
    solicitud.usuarioAutenticado = usuario;

    const requeridos =
      this.reflector.getAllAndMerge<string[]>(PERMISOS_REQUERIDOS, [contexto.getHandler(), contexto.getClass()]) ?? [];
    const faltantes = requeridos.filter((permiso) => !usuario.permisos.includes(permiso));
    if (faltantes.length > 0) {
      throw new ForbiddenException(`No tienes permiso para esta acción (${faltantes.join(', ')})`);
    }
    return true;
  }
}
