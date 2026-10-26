import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { TokenServicePort } from '../../../domain/ports/token.service.port';
import { TOKEN_SERVICE } from '../../../domain/ports/token.service.port';
import { LoginUsuarioDto } from '../../dto/usuarios/login-usuario.dto';
import * as bcrypt from 'bcrypt';

// Lo que ve quien intenta entrar y su cuenta todavía no puede
const MENSAJE_POR_ESTADO: Record<string, string> = {
  pendiente: 'Tu cuenta está pendiente de aprobación. Te avisaremos por correo cuando un administrador la apruebe.',
  rechazado: 'Tu solicitud de acceso fue rechazada. Comunícate con el administrador.',
  inactivo: 'Tu cuenta está desactivada. Comunícate con el administrador.',
  suspendido: 'Tu cuenta está suspendida. Comunícate con el administrador.',
};

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
      // Se devuelve el estado aparte del mensaje para que el frontend lo
      // muestre como aviso y no como error de credenciales.
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'Unauthorized',
        estado: usuario.obtenerEstado(),
        message: MENSAJE_POR_ESTADO[usuario.obtenerEstado()] ?? 'Tu cuenta no está activa.',
      });
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