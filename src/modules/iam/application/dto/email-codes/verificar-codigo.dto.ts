import { IsEmail, IsEnum, IsNotEmpty, Length } from 'class-validator';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';

export class VerificarCodigoDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  codigo: string;

  @IsEnum(TipoCodigo, { message: 'El tipo de código no es válido' })
  @IsNotEmpty({ message: 'El tipo de código es obligatorio' })
  tipo: TipoCodigo;
}