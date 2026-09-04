import { IsString, IsOptional } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  mensaje: string;

  @IsOptional()
  @IsString()
  contexto?: string;
}
