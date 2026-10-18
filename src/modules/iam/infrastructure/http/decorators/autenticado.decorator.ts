import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermisosGuard } from '../guards/permisos.guard';
import { RequierePermisos } from './requiere-permisos.decorator';

export function Autenticado(...permisos: string[]) {
  return applyDecorators(UseGuards(JwtAuthGuard, PermisosGuard), RequierePermisos(...permisos));
}
