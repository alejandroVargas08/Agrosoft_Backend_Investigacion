import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CrearCultivoDto } from './crear-cultivo.dto';

/**
 * Antes esto era una interfaz. El ValidationPipe no puede validar una interfaz
 * (desaparece al compilar), asi que PATCH /cultivos/:id aceptaba cualquier JSON.
 *
 * Se deja fuera loteId: mover un cultivo de lote invalidaria sus cosechas y sus
 * actividades, que apuntan al lote original.
 */
export class ActualizarCultivoDto extends PartialType(
    OmitType(CrearCultivoDto, ['loteId'] as const),
) {}
