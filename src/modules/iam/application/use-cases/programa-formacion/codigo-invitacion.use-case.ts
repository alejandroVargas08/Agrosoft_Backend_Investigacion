import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AlcanceDatos } from '../../../domain/value-objects/alcance-datos.vo';
import { CodigoInvitacion } from '../../../domain/entities/codigo-invitacion.entity';
import { CODIGO_INVITACION_REPOSITORY } from '../../../domain/ports/codigo-invitacion.repository.token';
import type { CodigoInvitacionRepositoryPort } from '../../../domain/ports/codigo-invitacion.repository.port';
import { GestionarProgramasFormacionUseCase } from './gestionar-programas-formacion.use-case';

const DIAS_DE_VIDA = 30;
// Sin I, O, 0 ni 1: en pantalla se confunden y el codigo se teclea a mano
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface CodigoInvitacionRespuesta {
    codigo: string;
    expiraEn: Date;
}

/**
 * El codigo de invitacion de una ficha. Solo lo maneja quien tiene esa ficha a
 * cargo: el alcance de datos decide, no el rol, igual que en el resto del
 * modulo.
 */
@Injectable()
export class CodigoInvitacionUseCase {
    constructor(
        @Inject(CODIGO_INVITACION_REPOSITORY)
        private readonly repositorio: CodigoInvitacionRepositoryPort,
        private readonly programas: GestionarProgramasFormacionUseCase,
    ) {}

    /** El codigo vivo de la ficha, o null si no hay o ya vencio. */
    async obtener(programaFormacionId: number, alcance: AlcanceDatos): Promise<CodigoInvitacionRespuesta | null> {
        await this.exigirFichaPropia(programaFormacionId, alcance);
        const codigo = await this.repositorio.buscarVigenteDe(programaFormacionId);
        return codigo ? { codigo: codigo.codigo, expiraEn: codigo.expiraEn } : null;
    }

    /** Emite uno nuevo. El anterior deja de servir en el mismo momento. */
    async generar(
        programaFormacionId: number,
        creadoPorId: number,
        alcance: AlcanceDatos,
    ): Promise<CodigoInvitacionRespuesta> {
        await this.exigirFichaPropia(programaFormacionId, alcance);
        await this.repositorio.anularDe(programaFormacionId);

        const expiraEn = new Date(Date.now() + DIAS_DE_VIDA * 24 * 60 * 60_000);

        // Reintenta si el azar choca con un codigo ya emitido
        for (let intento = 0; intento < 5; intento++) {
            const codigo = this.generarTexto();
            if (await this.repositorio.buscarPorCodigo(codigo)) continue;
            const guardado = await this.repositorio.guardar(
                new CodigoInvitacion(codigo, programaFormacionId, expiraEn, creadoPorId),
            );
            return { codigo: guardado.codigo, expiraEn: guardado.expiraEn };
        }

        throw new BadRequestException('No se pudo generar un código de invitación único. Intenta otra vez.');
    }

    /**
     * De un codigo a la ficha, para el registro. Devuelve null si no existe,
     * y lanza si existe pero ya no sirve: son dos cosas distintas y el
     * aprendiz merece saber cual le pasó.
     */
    async resolverPrograma(codigo: string): Promise<number | null> {
        const encontrado = await this.repositorio.buscarPorCodigo(codigo.trim().toUpperCase());
        if (!encontrado) return null;
        if (!encontrado.estaVigente()) {
            throw new BadRequestException('Ese código de invitación ya venció. Pídele uno nuevo a tu instructor.');
        }
        return encontrado.programaFormacionId;
    }

    /** Una ficha que no esté a cargo del usuario no existe para él. */
    private async exigirFichaPropia(programaFormacionId: number, alcance: AlcanceDatos): Promise<void> {
        const suyas = await this.programas.listarAsignables(alcance);
        if (!suyas.some((programa) => programa.id === programaFormacionId)) {
            throw new NotFoundException(`Ficha ${programaFormacionId} no encontrada`);
        }
    }

    private generarTexto(): string {
        const letra = () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
        const bloque = () => letra() + letra() + letra();
        return bloque() + '-' + bloque();
    }
}
