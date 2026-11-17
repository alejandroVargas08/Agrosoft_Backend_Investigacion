import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from "class-validator";

export class AsignarActividadDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @IsInt({ each: true })
    aprendizIds: number[];

    @IsOptional()
    @IsDateString()
    fechaLimite?: string;
}

export class EntregarTareaDto {
    @IsNumber()
    @Min(0.1)
    horasTrabajadas: number;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comentario?: string;
}

export class AprobarTareaDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    comentario?: string;
}

export class DevolverTareaDto {
    @IsString()
    @MinLength(3)
    @MaxLength(1000)
    comentario: string;
}
