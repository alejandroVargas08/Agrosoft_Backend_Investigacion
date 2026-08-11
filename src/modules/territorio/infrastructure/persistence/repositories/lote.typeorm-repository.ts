import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { LoteRepositoryPort } from '../../../domain/ports/lote.repository.port';
import { Lote } from '../../../domain/entities/lote.entity';
import { LoteOrmEntity } from '../orm-entities/lote.orm-entity';
import { LoteMapper } from '../mappers/lote.mapper';

@Injectable()
export class LoteTypeOrmRepository implements LoteRepositoryPort {
constructor(
    @InjectRepository(LoteOrmEntity)
    private readonly repo: Repository<LoteOrmEntity>,
) {}

    async buscarPorId(id: number): Promise<Lote | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
    return encontrado ? LoteMapper.aDominio(encontrado) : null;
}

    async buscarTodos(): Promise<Lote[]> {
        const todos = await this.repo.find();
    return todos.map(LoteMapper.aDominio);
}

    async guardar(lote: Lote): Promise<Lote> {
        const ormData = LoteMapper.aOrm(lote);
        const guardado = await this.repo.save(ormData);
    return LoteMapper.aDominio(guardado as LoteOrmEntity);
}

    async eliminar(id: number): Promise<void> {
        await this.repo.softDelete(id);
}

    async existePorId(id: number): Promise<boolean> {
        const count = await this.repo.count({ where: { id } });
    return count > 0;
}
}