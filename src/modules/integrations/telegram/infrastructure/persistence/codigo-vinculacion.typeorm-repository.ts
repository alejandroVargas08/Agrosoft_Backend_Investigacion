import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { CodigoVinculacionRepositoryPort } from '../../domain/ports/codigo-vinculacion.repository.port';
import { CodigoVinculacion } from '../../domain/entities/codigo-vinculacion.entity';
import { CodigoVinculacionOrmEntity } from './codigo-vinculacion.orm-entity';

@Injectable()
export class CodigoVinculacionTypeOrmRepository implements CodigoVinculacionRepositoryPort {
    constructor(
        @InjectRepository(CodigoVinculacionOrmEntity)
        private readonly repo: Repository<CodigoVinculacionOrmEntity>,
    ) {}

    private aDominio(fila: CodigoVinculacionOrmEntity): CodigoVinculacion {
        return new CodigoVinculacion(fila.codigo, fila.usuarioId, fila.expiraEn, fila.usadoEn, fila.id);
    }

    async guardar(codigo: CodigoVinculacion): Promise<CodigoVinculacion> {
        const fila = await this.repo.save({
            codigo: codigo.codigo,
            usuarioId: codigo.usuarioId,
            expiraEn: codigo.expiraEn,
            usadoEn: codigo.usadoEn,
        });
        return this.aDominio(fila);
    }

    async buscarPorCodigo(codigo: string): Promise<CodigoVinculacion | null> {
        const fila = await this.repo.findOne({ where: { codigo } });
        return fila ? this.aDominio(fila) : null;
    }

    async marcarUsado(id: number): Promise<void> {
        await this.repo.update({ id }, { usadoEn: new Date() });
    }

    async invalidarPendientesDe(usuarioId: number): Promise<void> {
        // Se marcan como usados para que no queden dos codigos vivos a la vez
        await this.repo.update({ usuarioId, usadoEn: IsNull() }, { usadoEn: new Date() });
    }
}
