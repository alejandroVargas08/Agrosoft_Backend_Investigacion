import { Inject, Injectable } from '@nestjs/common';
import { MOVIMIENTO_INSUMO_REPOSITORY_PORT } from '../../../domain/ports/movimiento-insumo.repository.port';
import type { MovimientoInsumoRepositoryPort } from '../../../domain/ports/movimiento-insumo.repository.port';
import { MovimientoOutput, toMovimientoOutput } from '../../dto/movimiento-insumo.dto';
import { USUARIO_REPOSITORY } from '../../../../iam/domain/ports/usuario.repository.token';
import type { UsuarioRepositoryPort } from '../../../../iam/domain/ports/usuario.repository.port';

interface PersonaResumen {
    id: number;
    nombre: string;
    apellido: string;
}

@Injectable()
export class ListarMovimientosUseCase {
    constructor(
        @Inject(MOVIMIENTO_INSUMO_REPOSITORY_PORT)
        private readonly movimientoRepo: MovimientoInsumoRepositoryPort,
        @Inject(USUARIO_REPOSITORY)
        private readonly usuarios: UsuarioRepositoryPort,
    ) {}

    async ejecutar(): Promise<MovimientoOutput[]> {
        const movimientos = await this.movimientoRepo.buscarTodos();

        // La pantalla muestra quien hizo el movimiento, pero la tabla solo
        // guarda usuarioId. Se resuelve una vez por usuario, no por fila.
        const personasPorId = new Map<number, PersonaResumen | null>();
        for (const movimiento of movimientos) {
            if (!personasPorId.has(movimiento.usuarioId)) {
                personasPorId.set(movimiento.usuarioId, await this.persona(movimiento.usuarioId));
            }
        }

        return movimientos.map((movimiento) => ({
            ...toMovimientoOutput(movimiento),
            usuario: personasPorId.get(movimiento.usuarioId) ?? null,
        }));
    }

    private async persona(usuarioId: number): Promise<PersonaResumen | null> {
        const usuario = await this.usuarios.buscarPorId(usuarioId);
        if (!usuario) return null;
        return { id: usuario.obtenerId(), nombre: usuario.obtenerNombre(), apellido: usuario.obtenerApellido() };
    }
}
