import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CODIGO_VINCULACION_REPOSITORY_PORT } from '../../domain/ports/codigo-vinculacion.repository.port';
import type { CodigoVinculacionRepositoryPort } from '../../domain/ports/codigo-vinculacion.repository.port';
import { VINCULO_USUARIO_REPOSITORY_PORT } from '../../domain/ports/vinculo-usuario.repository.port';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';
import { VinculoUsuario } from '../../domain/entities/vinculo-usuario.entity';
import { USUARIO_REPOSITORY } from '../../../../iam/domain/ports/usuario.repository.token';
import type { UsuarioRepositoryPort } from '../../../../iam/domain/ports/usuario.repository.port';

/**
 * Consume un codigo generado desde la web y deja el chat atado a ese usuario.
 * Es la alternativa a escribir correo y contrasena dentro de Telegram.
 */
@Injectable()
export class VincularConCodigoUseCase {
    constructor(
        @Inject(CODIGO_VINCULACION_REPOSITORY_PORT)
        private readonly codigos: CodigoVinculacionRepositoryPort,
        @Inject(VINCULO_USUARIO_REPOSITORY_PORT)
        private readonly vinculos: VinculoUsuarioRepositoryPort,
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarios: UsuarioRepositoryPort,
    ) {}

    async ejecutar(telegramUserId: string, codigoTexto: string): Promise<VinculoUsuario> {
        const codigo = await this.codigos.buscarPorCodigo(this.normalizar(codigoTexto));

        if (!codigo || !codigo.estaVigente()) {
            throw new UnauthorizedException('El código no sirve o ya expiró');
        }

        const usuario = await this.usuarios.buscarPorId(codigo.usuarioId);
        if (!usuario) {
            throw new UnauthorizedException('La cuenta del código ya no existe');
        }

        if (codigo.id !== null) await this.codigos.marcarUsado(codigo.id);

        return this.vinculos.guardar(
            new VinculoUsuario(
                telegramUserId,
                usuario.obtenerId(),
                usuario.obtenerNombreCompleto(),
                usuario.obtenerCorreo(),
            ),
        );
    }

    /** La gente lo escribe en minúscula, con espacios o sin el guion */
    private normalizar(texto: string): string {
        const limpio = texto.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        return limpio.length === 6 ? `${limpio.slice(0, 3)}-${limpio.slice(3)}` : limpio;
    }
}
