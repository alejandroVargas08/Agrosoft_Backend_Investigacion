import { IsInt, IsObject, IsString } from "class-validator";

export class registrarHistorialCultivoDto {
    @IsInt() 
    cultivoId: number;

    @IsInt()
    usuarioId: number;

    @IsString()
    motivo: string;

    @IsObject()
    cambios: Record<string, any>;

}