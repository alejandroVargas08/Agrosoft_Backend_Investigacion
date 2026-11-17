import { Inject, Injectable } from '@nestjs/common';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';

@Injectable()
export class DesvincularUsuarioUseCase {
    constructor(
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly repositorio: VinculoUsuarioRepositoryPort,
    ) {}

    async ejecutar(telegramUserId: string): Promise<void> {
        await this.repositorio.eliminar(telegramUserId);
    }
}