import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AlmacenRepositoryPort } from '../../../domain/ports/almacen.repository.port';
import { Almacen } from '../../../domain/entities/almacen.entity';
import { AlmacenOrmEntity } from '../orm-entities/almacen.orm-entity';
import { AlmacenMapper } from '../mappers/almacen.mapper';

@Injectable()
export class AlmacenTypeOrmRepository implements AlmacenRepositoryPort {
    constructor(
        @InjectRepository(AlmacenOrmEntity)
        private readonly repo: Repository<AlmacenOrmEntity>,
    ) {}

    async buscarPorId(id: number): Promise<Almacen | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? AlmacenMapper.aDominio(encontrado) : null;
    }

    async buscarTodos(): Promise<Almacen[]> {
        const todos = await this.repo.find();
        return todos.map(AlmacenMapper.aDominio);
    }

    async guardar(almacen: Almacen): Promise<Almacen> {
        const ormData = AlmacenMapper.aOrm(almacen);
        const guardado = await this.repo.save(ormData);
        return AlmacenMapper.aDominio(guardado as AlmacenOrmEntity);
    }

    async existePorId(id: number): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
        return count > 0;
    }
}