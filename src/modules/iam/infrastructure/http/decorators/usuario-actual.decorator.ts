import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsuarioAutenticado } from '../../../domain/value-objects/alcance-datos.vo';

export const UsuarioActual = createParamDecorator((_dato: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
  const solicitud = contexto.switchToHttp().getRequest<{ usuarioAutenticado?: UsuarioAutenticado }>();
  if (!solicitud.usuarioAutenticado) {
    throw new UnauthorizedException('Falta @Autenticado() en el controlador');
  }
  return solicitud.usuarioAutenticado;
});
