import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';

export class EnviarCodigoDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsEnum(TipoCodigo, { message: 'El tipo de código no es válido' })
  @IsNotEmpty({ message: 'El tipo de código es obligatorio' })
  tipo: TipoCodigo;
}