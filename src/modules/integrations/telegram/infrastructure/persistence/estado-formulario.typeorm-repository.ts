import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { EstadoFormularioRepositoryPort } from '../../domain/ports/estado-formulario.repository.port';
import { EstadoFormulario } from '../../domain/entities/estado-formulario.entity';
import { EstadoFormularioOrmEntity } from './estado-formulario.orm-entity';
import { EstadoFormularioMapper } from './estado-formulario.mapper';

@Injectable()
export class EstadoFormularioTypeOrmRepository implements EstadoFormularioRepositoryPort {
    constructor(
        @InjectRepository(EstadoFormularioOrmEntity)
        private readonly repo: Repository<EstadoFormularioOrmEntity>,
    ) {}

    async buscarPorTelegramUserId(telegramUserId: string): Promise<EstadoFormulario | null> {
        // Cada conversación nueva crea una fila: sin ordenar, `findOne` puede
        // devolver una antigua ya cerrada. Siempre interesa la más reciente.
        const encontrado = await this.repo.findOne({
            where: { telegramUserId },
            order: { id: 'DESC' },
        });
        return encontrado ? EstadoFormularioMapper.aDominio(encontrado) : null;
    }

    async guardar(estadoFormulario: EstadoFormulario): Promise<EstadoFormulario> {
        const ormData = EstadoFormularioMapper.aOrm(estadoFormulario);
        const guardado = await this.repo.save(ormData);
        return EstadoFormularioMapper.aDominio(guardado as EstadoFormularioOrmEntity);
    }
}