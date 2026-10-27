import { Inject, Injectable } from '@nestjs/common';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';

export interface EstadoVinculacion {
    vinculado: boolean;
}

/** Lo que la pantalla de Configuracion necesita saber del usuario en sesion. */
@Injectable()
export class EstadoVinculacionUseCase {
    constructor(
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly repositorio: VinculoUsuarioRepositoryPort,
    ) {}

    async ejecutar(usuarioId: number): Promise<EstadoVinculacion> {
        const vinculo = await this.repositorio.buscarPorUsuarioId(usuarioId);
        return { vinculado: vinculo !== null };
    }
}
