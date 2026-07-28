import { Usuario } from "../../../domain/entities/usuario.entity";
import type { UsuarioRepositoryPort } from "../../../domain/ports/usuario.repository.port";
import { Email } from "../../../domain/value-objects/email.vo";
import { Password } from "../../../domain/value-objects/password.vo";
import { CrearUsuarioDto } from "../../dto/usuarios/crear-usuario.dto";
import { Inject } from "@nestjs/common";
import { USUARIO_REPOSITORY } from "../../../domain/ports/usuario.repository.token";

export class CrearUsuarioUseCase{
    constructor(
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarioRepository: UsuarioRepositoryPort) {}

    async ejecutar(dto: CrearUsuarioDto): Promise<Usuario> {
        const email = Email.create(dto.email);
        const password = Password.fromHash(dto.password);

        const id = crypto.randomUUID();

        const usuario = Usuario.crear(id, dto.nombre, email, password);

        await this.usuarioRepository.guardar(usuario);

        return usuario;
    }
}