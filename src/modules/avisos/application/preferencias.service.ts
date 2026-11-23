import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PreferenciaNotificacionOrmEntity } from '../infrastructure/persistence/preferencia-notificacion.orm-entity';
import {
    PREFERENCIA_DE, PREFERENCIAS_POR_DEFECTO, PreferenciasNotificacion, TipoAviso,
} from '../domain/aviso';

@Injectable()
export class PreferenciasService {
    constructor(
        @InjectRepository(PreferenciaNotificacionOrmEntity)
        private readonly repo: Repository<PreferenciaNotificacionOrmEntity>,
    ) {}

    async obtener(usuarioId: number): Promise<PreferenciasNotificacion> {
        const fila = await this.repo.findOneBy({ usuarioId });
        if (!fila) return { ...PREFERENCIAS_POR_DEFECTO };
        return {
            alertasSensores: fila.alertasSensores,
            stockBajo: fila.stockBajo,
            actividadesVencidas: fila.actividadesVencidas,
            nuevasIncidencias: fila.nuevasIncidencias,
        };
    }

    async guardar(usuarioId: number, cambios: Partial<PreferenciasNotificacion>): Promise<PreferenciasNotificacion> {
        const actuales = await this.obtener(usuarioId);
        const nuevas = { ...actuales, ...cambios };
        await this.repo.save({ usuarioId, ...nuevas });
        return nuevas;
    }

    /** De estos usuarios, los que tienen encendido este tipo de aviso. */
    async quienesQuieren(usuarioIds: number[], tipo: TipoAviso): Promise<number[]> {
        if (usuarioIds.length === 0) return [];
        const campo = PREFERENCIA_DE[tipo];
        const filas = await this.repo.findBy({ usuarioId: In(usuarioIds) });
        const apagados = new Set(filas.filter((f) => !f[campo]).map((f) => f.usuarioId));
        return usuarioIds.filter((id) => !apagados.has(id));
    }
}
