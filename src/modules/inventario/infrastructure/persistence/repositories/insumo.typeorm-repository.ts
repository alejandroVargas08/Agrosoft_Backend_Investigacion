import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';
import { Insumo } from '../../../domain/entities/insumo.entity';
import { InsumoOrmEntity } from '../orm-entities/insumo.orm-entity';
import { InsumoMapper } from '../mappers/insumo.mapper';

@Injectable()
export class InsumoTypeOrmRepository implements InsumoRepositoryPort {
    constructor(
        @InjectRepository(InsumoOrmEntity)
        private readonly repo: Repository<InsumoOrmEntity>,
    ) {}

    async buscarPorId(id: number): Promise<Insumo | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? InsumoMapper.aDominio(encontrado) : null;
    }

    async buscarTodos(): Promise<Insumo[]> {
        const todos = await this.repo.find();
        return todos.map(InsumoMapper.aDominio);
    }

    async buscarConStockBajoMinimo(): Promise<Insumo[]> {
        const encontrados = await this.repo
        .createQueryBuilder('insumo')
        .where('insumo.stock_uso <= insumo.stock_minimo')
        .getMany();
        return encontrados.map(InsumoMapper.aDominio);
    }

    async guardar(insumo: Insumo): Promise<Insumo> {
        const ormData = InsumoMapper.aOrm(insumo);
        const guardado = await this.repo.save(ormData);
        return InsumoMapper.aDominio(guardado as InsumoOrmEntity);
    }

    async existePorId(id: number): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
        return count > 0;
    }
}