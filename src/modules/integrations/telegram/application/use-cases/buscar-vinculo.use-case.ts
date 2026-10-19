import { Inject, Injectable } from '@nestjs/common';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';
import { VinculoUsuario } from '../../domain/entities/vinculo-usuario.entity';

@Injectable()
export class BuscarVinculoUseCase {
    constructor(
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly repositorio: VinculoUsuarioRepositoryPort,
    ) {}

    async ejecutar(telegramUserId: string): Promise<VinculoUsuario | null> {
        return this.repositorio.buscarPorTelegramUserId(telegramUserId);
    }
}