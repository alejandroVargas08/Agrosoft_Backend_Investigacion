import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SubLoteRepositoryPort } from '../../../domain/ports/sublote.repository.port';
import { SubLote } from '../../../domain/entities/sublote.entity';
import { SubLoteOrmEntity } from '../orm-entities/sublote.orm-entity';
import { SubLoteMapper } from '../mappers/sublote.mapper';

@Injectable()
export class SubLoteTypeOrmRepository implements SubLoteRepositoryPort {
    constructor(
    @InjectRepository(SubLoteOrmEntity)
    private readonly repo: Repository<SubLoteOrmEntity>,
) {}

    async buscarPorId(id: number): Promise<SubLote | null> {
    const encontrado = await this.repo.findOne({ where: { id } });
    return encontrado ? SubLoteMapper.aDominio(encontrado) : null;
}

    async buscarPorLoteId(loteId: number): Promise<SubLote[]> {
    const encontrados = await this.repo.find({ where: { loteId } });
    return encontrados.map(SubLoteMapper.aDominio);
}

    async guardar(subLote: SubLote): Promise<SubLote> {
    const ormData = SubLoteMapper.aOrm(subLote);
    const guardado = await this.repo.save(ormData);
    return SubLoteMapper.aDominio(guardado as SubLoteOrmEntity);
}

    async eliminar(id: number): Promise<void> {
    await this.repo.softDelete(id);
}
}