import { PartialType } from '@nestjs/mapped-types';
import { CreateProductosAgroDto } from './create-productos-agro.dto';

export class UpdateProductosAgroDto extends PartialType(CreateProductosAgroDto) {}
