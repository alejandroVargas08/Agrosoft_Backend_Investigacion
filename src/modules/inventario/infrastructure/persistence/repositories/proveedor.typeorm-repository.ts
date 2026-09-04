import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ProveedorRepositoryPort } from '../../../domain/ports/proveedor.repository.port';
import { Proveedor } from '../../../domain/entities/proveedor.entity';
import { ProveedorOrmEntity } from '../orm-entities/proveedor.orm-entity';
import { ProveedorMapper } from '../mappers/proveedor.mapper';

@Injectable()
export class ProveedorTypeOrmRepository implements ProveedorRepositoryPort {
    constructor(
        @InjectRepository(ProveedorOrmEntity)
        private readonly repo: Repository<ProveedorOrmEntity>,
    ) {}

    async buscarPorId(id: number): Promise<Proveedor | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? ProveedorMapper.aDominio(encontrado) : null;
    }

    async buscarTodos(): Promise<Proveedor[]> {
        const todos = await this.repo.find();
        return todos.map(ProveedorMapper.aDominio);
    }

    async guardar(proveedor: Proveedor): Promise<Proveedor> {
        const ormData = ProveedorMapper.aOrm(proveedor);
        const guardado = await this.repo.save(ormData);
        return ProveedorMapper.aDominio(guardado as ProveedorOrmEntity);
    }

    async existePorId(id: number): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
        return count > 0;
    }
}