import { Inject, Injectable } from '@nestjs/common';
import { CODIGO_VINCULACION_REPOSITORY_PORT } from '../../domain/ports/codigo-vinculacion.repository.port';
import type { CodigoVinculacionRepositoryPort } from '../../domain/ports/codigo-vinculacion.repository.port';
import { CodigoVinculacion } from '../../domain/entities/codigo-vinculacion.entity';

const MINUTOS_DE_VIDA = 10;
// Sin I, O, 0 ni 1: en pantalla se confunden y el codigo se teclea a mano
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class GenerarCodigoVinculacionUseCase {
    constructor(
        @Inject(CODIGO_VINCULACION_REPOSITORY_PORT)
        private readonly repositorio: CodigoVinculacionRepositoryPort,
    ) {}

    async ejecutar(usuarioId: number): Promise<CodigoVinculacion> {
        // Un solo codigo vivo por usuario: pedir uno nuevo anula el anterior
        await this.repositorio.invalidarPendientesDe(usuarioId);

        const expiraEn = new Date(Date.now() + MINUTOS_DE_VIDA * 60_000);

        // Reintenta si el azar choca con un codigo ya emitido
        for (let intento = 0; intento < 5; intento++) {
            const codigo = this.generar();
            if (await this.repositorio.buscarPorCodigo(codigo)) continue;
            return this.repositorio.guardar(new CodigoVinculacion(codigo, usuarioId, expiraEn));
        }

        throw new Error('No se pudo generar un codigo de vinculacion unico');
    }

    private generar(): string {
        const letra = () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
        const bloque = () => letra() + letra() + letra();
        return `${bloque()}-${bloque()}`;
    }
}
