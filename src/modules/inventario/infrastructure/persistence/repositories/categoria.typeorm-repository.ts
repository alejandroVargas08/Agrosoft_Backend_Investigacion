import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CategoriaRepositoryPort } from '../../../domain/ports/categoria.repository.port';
import { Categoria } from '../../../domain/entities/categoria.entity';
import { CategoriaOrmEntity } from '../orm-entities/categoria.orm-entity';
import { CategoriaMapper } from '../mappers/categoria.mapper';

@Injectable()
export class CategoriaTypeOrmRepository implements CategoriaRepositoryPort {
    constructor(
        @InjectRepository(CategoriaOrmEntity)
        private readonly repo: Repository<CategoriaOrmEntity>,
    ) {}

    async buscarPorId(id: number): Promise<Categoria | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? CategoriaMapper.aDominio(encontrado) : null;
    }

    async buscarTodos(): Promise<Categoria[]> {
        const todos = await this.repo.find();
        return todos.map(CategoriaMapper.aDominio);
    }

    async guardar(categoria: Categoria): Promise<Categoria> {
        const ormData = CategoriaMapper.aOrm(categoria);
        const guardado = await this.repo.save(ormData);
        return CategoriaMapper.aDominio(guardado as CategoriaOrmEntity);
    }

    async existePorId(id: number): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
        return count > 0;
    }
}