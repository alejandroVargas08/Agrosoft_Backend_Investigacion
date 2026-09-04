import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaccionesFinancieraDto } from './create-transacciones-financiera.dto';

export class UpdateTransaccionesFinancieraDto extends PartialType(CreateTransaccionesFinancieraDto) {}
