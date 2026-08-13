import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import { LoginUsuarioDto } from '../../dto/usuarios/login-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
  ) {}

  async ejecutar(dto: LoginUsuarioDto) {
    const usuario = await this.usuarioRepository.buscarPorCorreo(dto.correo);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.obtenerContrasenaHash());
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    usuario.registrarLogin();
    await this.usuarioRepository.actualizar(usuario);

    return usuario;
  }
}
