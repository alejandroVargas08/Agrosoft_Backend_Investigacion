import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { MovimientoInsumoRepositoryPort } from '../../../domain/ports/movimiento-insumo.repository.port';
import { MovimientoInsumo } from '../../../domain/entities/movimiento-insumo.entity';
import { MovimientoInsumoOrmEntity } from '../orm-entities/movimiento-insumo.orm-entity';
import { InsumoOrmEntity } from '../orm-entities/insumo.orm-entity';
import { MovimientoInsumoMapper } from '../mappers/movimiento-insumo.mapper';
import { InsumoMapper } from '../mappers/insumo.mapper';
import type { Insumo } from '../../../domain/entities/insumo.entity';

@Injectable()
export class MovimientoInsumoTypeOrmRepository implements MovimientoInsumoRepositoryPort {
    constructor(
        @InjectRepository(MovimientoInsumoOrmEntity)
        private readonly repo: Repository<MovimientoInsumoOrmEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) {}

    async buscarPorId(id: number): Promise<MovimientoInsumo | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? MovimientoInsumoMapper.aDominio(encontrado) : null;
    }

    async buscarPorInsumoId(insumoId: number): Promise<MovimientoInsumo[]> {
        const encontrados = await this.repo.find({ where: { insumoId } });
        return encontrados.map(MovimientoInsumoMapper.aDominio);
    }

    async guardar(movimiento: MovimientoInsumo): Promise<MovimientoInsumo> {
        const ormData = MovimientoInsumoMapper.aOrm(movimiento);
        const guardado = await this.repo.save(ormData);
        return MovimientoInsumoMapper.aDominio(guardado as MovimientoInsumoOrmEntity);
    }

    /**
     * Guarda el insumo actualizado Y el movimiento como UNA sola transacción.
     * Si cualquiera de los dos falla, ambos se revierten.
     */
    async guardarConInsumo(insumo: Insumo, movimiento: MovimientoInsumo): Promise<MovimientoInsumo> {
        return this.dataSource.transaction(async (manager) => {
        const insumoOrmData = InsumoMapper.aOrm(insumo);
        await manager.save(InsumoOrmEntity, insumoOrmData);

        const movimientoOrmData = MovimientoInsumoMapper.aOrm(movimiento);
        const movimientoGuardado = await manager.save(MovimientoInsumoOrmEntity, movimientoOrmData);

        return MovimientoInsumoMapper.aDominio(movimientoGuardado);
        });
    }
}