import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { USUARIO_REPOSITORY } from '../../../domain/ports/usuario.repository.token';
import { ReconocimientoRostroService } from '../../../infrastructure/services/reconocimiento-rostro.service';
import { LoginRostroDto } from '../../dto/usuarios/login-rostro.dto';
import { LoginUsuarioUseCase } from './login-usuario.use-case';

const PORCENTAJE_ACIERTOS = 0.8;
const NO_COINCIDE = 'Tu rostro no coincide con esta cuenta. Intenta de nuevo o usa tu contraseña.';

@Injectable()
export class LoginRostroUseCase {
  private readonly logger = new Logger(LoginRostroUseCase.name);

  constructor(
    private readonly reconocimiento: ReconocimientoRostroService,
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly loginUsuario: LoginUsuarioUseCase,
  ) {}

  async ejecutar(dto: LoginRostroDto) {
    const usuario = await this.usuarioRepository.buscarPorCorreo(dto.correo);
    if (!usuario) {
      throw new UnauthorizedException(NO_COINCIDE);
    }

    const fotos = this.reconocimiento.decodificar(dto.imagenes);
    // Una cuenta sin rostro registrado responde igual que un correo que no
    // existe: si el mensaje fuera distinto, se podria averiguar que correos
    // tienen cuenta en AgroSoft.
    let resultado: Awaited<ReturnType<ReconocimientoRostroService['verificar']>>;
    try {
      resultado = await this.reconocimiento.verificar(usuario.obtenerCorreo(), fotos);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.log(`Login rostro usuario ${usuario.obtenerId()}: sin rostro registrado`);
        throw new UnauthorizedException(NO_COINCIDE);
      }
      throw error;
    }
    const requeridos = Math.ceil(resultado.total * PORCENTAJE_ACIERTOS);

    this.logger.log(
      `Login rostro usuario ${usuario.obtenerId()}: ${resultado.aciertos}/${resultado.total} aciertos (umbral ${this.reconocimiento.umbral()}) -> ${resultado.detalle}`,
    );

    if (resultado.aciertos < requeridos) {
      throw new UnauthorizedException(NO_COINCIDE);
    }

    return this.loginUsuario.iniciarSesion(usuario);
  }
}