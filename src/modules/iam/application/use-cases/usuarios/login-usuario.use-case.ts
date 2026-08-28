import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { TokenServicePort } from '../../../domain/ports/token.service.port';
import { TOKEN_SERVICE } from '../../../domain/ports/token.service.port';
import { LoginUsuarioDto } from '../../dto/usuarios/login-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
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

    if (!usuario.estaActivo()) {
      throw new UnauthorizedException('El usuario no está activo');
    }

    usuario.registrarLogin();
    await this.usuarioRepository.actualizar(usuario);

    const accessToken = this.tokenService.generar({
      sub: usuario.obtenerId(),
      correo: usuario.obtenerCorreo(),
      rolId: usuario.obtenerRolId(),
    });

    return {
      access_token: accessToken,
      usuario: {
        id: usuario.obtenerId(),
        nombre: usuario.obtenerNombreCompleto(),
        correo: usuario.obtenerCorreo(),
        rolId: usuario.obtenerRolId(),
      },
    };
  }
}