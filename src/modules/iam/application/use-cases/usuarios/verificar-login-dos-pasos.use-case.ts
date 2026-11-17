import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import type { TokenServicePort } from '../../../domain/ports/token.service.port';
import { TOKEN_SERVICE } from '../../../domain/ports/token.service.port';
import { VerificarCodigoUseCase } from '../email-codes/verificar-codigo.usecase';
import { TipoCodigo } from '../../../domain/entities/email-code.entity';
import { VerificarLoginDosPasosDto } from '../../dto/usuarios/verificar-login-dos-pasos.dto';

/**
 * Segundo paso del login cuando el usuario tiene la verificacion activa.
 *
 * El primer paso ya comprobo la contraseña y mando el codigo. Aqui solo se
 * valida ese codigo, pero se vuelve a revisar el estado de la cuenta: entre
 * un paso y otro un administrador pudo suspenderla.
 */
@Injectable()
export class VerificarLoginDosPasosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
    private readonly verificarCodigo: VerificarCodigoUseCase,
  ) {}

  async ejecutar(dto: VerificarLoginDosPasosDto) {
    const usuario = await this.usuarioRepository.buscarPorCorreo(dto.correo);

    // Mismo mensaje que con una contraseña mala: no se le dice a nadie si un
    // correo existe o si tiene la verificacion activa.
    if (!usuario || !usuario.tieneDosPasos()) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.estaActivo()) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        estado: usuario.obtenerEstado(),
        message: 'Tu cuenta no está activa.',
      });
    }

    // Lanza BadRequestException si el codigo no existe, no coincide o expiro.
    await this.verificarCodigo.ejecutar(dto.correo, dto.codigo, TipoCodigo.DOS_PASOS);

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
