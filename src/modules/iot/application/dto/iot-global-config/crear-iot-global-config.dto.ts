import { IsString, IsInt, IsOptional, IsBoolean, Min, Max, MinLength } from 'class-validator';

export class CrearIotGlobalConfigDto {
  @IsString() @MinLength(2)
  nombre: string;

  @IsString()
  agente: string;

  @IsInt() @Min(1) @Max(65535)
  puerto: number;

  @IsString()
  protocolo: string;

  @IsString() @MinLength(3)
  nombreUsuario: string;

  @IsString() @MinLength(4)
  contrasena: string;

  @IsString()
  prefijoTema: string;

  @IsOptional() @IsString()
  temasPredeterminados?: string;

  @IsOptional() @IsString()
  temasPersonalizados?: string;

  @IsOptional() @IsInt()
  loteId?: number;

  @IsOptional() @IsInt()
  subLoteId?: number;

  @IsOptional() @IsBoolean()
  autoDiscover?: boolean;
}