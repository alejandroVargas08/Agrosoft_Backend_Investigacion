import { Usuario } from "../../../domain/entities/usuario.entity";
import type { UsuarioRepositoryPort } from "../../../domain/ports/usuario.repository.port";
import { CrearUsuarioDto } from "../../dto/usuarios/crear-usuario.dto";
import { Inject, Injectable } from "@nestjs/common";
import { USUARIO_REPOSITORY } from "../../../domain/ports/usuario.repository.token";
import { Email } from "../../../domain/value-objects/email.vo";
import { Password } from "../../../domain/value-objects/password.vo";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CrearUsuarioUseCase {
    constructor(
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarioRepository: UsuarioRepositoryPort,
    ) {}

    async ejecutar(dto: CrearUsuarioDto): Promise<Usuario> {

        Email.create(dto.email);
        Password.fromHash(dto.password);

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(dto.password, salt);

        const usuario = Usuario.crear({
            id: 0,
            nombre: dto.nombre,
            apellido: dto.apellido,
            identificacion: dto.identificacion,
            idFicha: dto.idFicha ?? undefined,
            programaFormacionId: dto.programaFormacionId ?? undefined,
            telefono: dto.telefono,
            correo: dto.email,
            contrasenaHash: contrasenaHash,
            rolId: dto.rolId,
        });

        await this.usuarioRepository.guardar(usuario);

        return usuario;
    }
}