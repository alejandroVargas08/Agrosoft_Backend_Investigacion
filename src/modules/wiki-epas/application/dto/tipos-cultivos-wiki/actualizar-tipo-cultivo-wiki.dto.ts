import { PartialType } from '@nestjs/mapped-types';
import { CrearTipoCultivoWikiDto } from './crear-tipo-cultivo-wiki.dto';

export class ActualizarTipoCultivoWikiDto extends PartialType(CrearTipoCultivoWikiDto) {}