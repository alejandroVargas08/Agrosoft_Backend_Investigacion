import { PartialType } from '@nestjs/mapped-types';
import { CrearWikiTipoEpaDto } from './crear-wiki-tipo-epa.dto';

export class ActualizarWikiTipoEpaDto extends PartialType(CrearWikiTipoEpaDto) {}