import { Inject, Injectable } from '@nestjs/common';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';

/**
 * Desvincula desde la web. El /salir del bot usa el telegramUserId;
 * aqui solo se conoce quien esta en sesion.
 */
@Injectable()
export class DesvincularPorUsuarioUseCase {
    constructor(
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly repositorio: VinculoUsuarioRepositoryPort,
    ) {}

    async ejecutar(usuarioId: number): Promise<void> {
        await this.repositorio.eliminarPorUsuarioId(usuarioId);
    }
}
