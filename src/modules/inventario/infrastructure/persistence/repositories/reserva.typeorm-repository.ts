import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ReservaRepositoryPort } from '../../../domain/ports/reserva.repository.port';
import { Reserva } from '../../../domain/entities/reserva.entity';
import { ReservaOrmEntity } from '../orm-entities/reserva.orm-entity';
import { ReservaMapper } from '../mappers/reserva.mapper';

@Injectable()
export class ReservaTypeOrmRepository implements ReservaRepositoryPort {
    constructor(
        @InjectRepository(ReservaOrmEntity)
        private readonly repo: Repository<ReservaOrmEntity>,
    ) {}

    async buscarPorId(id: number): Promise<Reserva | null> {
        const encontrado = await this.repo.findOne({ where: { id } });
        return encontrado ? ReservaMapper.aDominio(encontrado) : null;
    }

    async buscarPorInsumoId(insumoId: number): Promise<Reserva[]> {
        const encontrados = await this.repo.find({ where: { insumoId } });
        return encontrados.map(ReservaMapper.aDominio);
    }

    async guardar(reserva: Reserva): Promise<Reserva> {
        const ormData = ReservaMapper.aOrm(reserva);
        const guardado = await this.repo.save(ormData);
        return ReservaMapper.aDominio(guardado as ReservaOrmEntity);
    }
}