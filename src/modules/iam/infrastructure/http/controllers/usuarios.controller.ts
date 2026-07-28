import { Body,Post, Controller } from "@nestjs/common";
import { CrearUsuarioUseCase } from "../../../application/use-cases/usuarios/crear-usuario.use-case";
import { CrearUsuarioDto } from "../../../application/dto/usuarios/crear-usuario.dto";


@Controller('usuarios')
export class UsuariosController{
    constructor(
        private readonly crearUsuarioUseCase: CrearUsuarioUseCase
    ){}

    @Post()
    async crear(@Body() dto: CrearUsuarioDto){
        const usuario= await this.crearUsuarioUseCase.ejecutar(dto);

        return {
            id: usuario.getId(),
            nombre: usuario.getNombre(),
            email: usuario.getEmail().getValue(),
            activo: usuario.getActivo(),
        };
    }
}