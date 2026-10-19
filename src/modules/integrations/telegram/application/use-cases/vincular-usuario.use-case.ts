import { Inject, Injectable } from '@nestjs/common';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';
import { VinculoUsuario } from '../../domain/entities/vinculo-usuario.entity';
import { LoginUsuarioUseCase } from '../../../../iam/application/use-cases/usuarios/login-usuario.use-case';

/**
 * Valida las credenciales con el mismo caso de uso que usa el login de la web
 * y, si son correctas, deja el chat de Telegram atado a ese usuario.
 */
@Injectable()
export class VincularUsuarioUseCase {
    constructor(
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly repositorio: VinculoUsuarioRepositoryPort,
        private readonly loginUsuario: LoginUsuarioUseCase,
    ) {}

    async ejecutar(telegramUserId: string, correo: string, password: string): Promise<VinculoUsuario> {
        // Lanza UnauthorizedException si el correo o la contraseña no sirven
        const resultado = await this.loginUsuario.ejecutar({ correo, password });

        return this.repositorio.guardar(
            new VinculoUsuario(
                telegramUserId,
                resultado.usuario.id,
                resultado.usuario.nombre,
                resultado.usuario.correo,
            ),
        );
    }
}