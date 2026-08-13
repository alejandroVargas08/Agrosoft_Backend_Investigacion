import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoAgroDto } from '../dto/create-productos-agro.dto';

export class UpdateProductoAgroDto extends PartialType(CreateProductoAgroDto) {}