import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class crearActividadesDto {
    @IsString()
    nombre: string;
    
    @IsString()
    tipo: string;

    @IsOptional()
    @IsString()
    subtipo?: string;

    @IsInt()
    loteId: number;

    @IsOptional()
    @IsInt()
    subLoteId: number;

    @IsInt()
    cultivoId: number;

    @IsDateString()
    fecha: string;

    @IsNumber()
    @Min(0)
    horasActividad: number;

    @IsNumber()
    @Min(0)
    precioHoraActividad: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsInt()
    creadoPorUsuarioId: number;

    @IsOptional()
    @IsInt()
    cantidadPlantas?: number; 

    @IsOptional()
    @IsInt()
    productoAgroId: number;
}