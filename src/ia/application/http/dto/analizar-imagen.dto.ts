import { IsString } from "class-validator";

export class AnalizarImagenDto{
    @IsString()
    imagen: string;

    @IsString()
    prompt: string;
}