import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { VinculoUsuarioRepositoryPort } from '../../domain/ports/vinculo-usuario.repository.port';
import { VinculoUsuario } from '../../domain/entities/vinculo-usuario.entity';
import { VinculoUsuarioOrmEntity } from './vinculo-usuario.orm-entity';

@Injectable()
export class VinculoUsuarioTypeOrmRepository implements VinculoUsuarioRepositoryPort {
    constructor(
        @InjectRepository(VinculoUsuarioOrmEntity)
        private readonly repo: Repository<VinculoUsuarioOrmEntity>,
    ) {}

    async buscarPorTelegramUserId(telegramUserId: string): Promise<VinculoUsuario | null> {
        const fila = await this.repo.findOne({ where: { telegramUserId } });
        if (!fila) return null;
        return new VinculoUsuario(fila.telegramUserId, fila.usuarioId, fila.nombre, fila.correo, fila.id);
    }

    async guardar(vinculo: VinculoUsuario): Promise<VinculoUsuario> {
        // Si el chat ya estaba vinculado se reemplaza, no se duplica
        const existente = await this.repo.findOne({
            where: { telegramUserId: vinculo.telegramUserId },
        });

        const fila = await this.repo.save({
            id: existente?.id,
            telegramUserId: vinculo.telegramUserId,
            usuarioId: vinculo.usuarioId,
            nombre: vinculo.nombre,
            correo: vinculo.correo,
        });

        return new VinculoUsuario(fila.telegramUserId, fila.usuarioId, fila.nombre, fila.correo, fila.id);
    }

    async eliminar(telegramUserId: string): Promise<void> {
        await this.repo.delete({ telegramUserId });
    }
}