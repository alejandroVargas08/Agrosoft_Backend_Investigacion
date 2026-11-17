import { SetMetadata } from '@nestjs/common';

export const PERMISOS_REQUERIDOS = 'permisos_requeridos';

export const RequierePermisos = (...permisos: string[]) => SetMetadata(PERMISOS_REQUERIDOS, permisos);
