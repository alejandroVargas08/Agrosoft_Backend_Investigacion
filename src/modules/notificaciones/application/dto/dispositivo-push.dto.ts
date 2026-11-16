import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegistrarDispositivoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  readonly token: string;

  @IsString()
  @IsIn(['android', 'ios'])
  readonly plataforma: string;
}

export class QuitarDispositivoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  readonly token: string;
}
