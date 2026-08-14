import { IsInt, IsNumber, IsString, Min } from "class-validator";

export class registraractividadServicioDto{
    @IsString()
    nombreServicio: string;

    @IsInt()
    proveedorId: number;

    @IsInt()
    maquinariaId: number;

    @IsNumber()
    @Min(0.01)
    horas: number;

    @IsNumber()
    @Min(0)
    precioHora: number; 
}