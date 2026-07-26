import { Injectable } from "@nestjs/common";
import { HistorialCultivoRepositoryPort } from "../../domain/ports/historial-cultivo.port";
import { InjectRepository } from "@nestjs/typeorm";
import { historialCultivoOrmEntity } from "../historial-cultivo.orm-entity";
import { Repository } from "typeorm";
import { historialCultivo } from "../../domain/entities/historial-cultivo.entity";

@Injectable()
export class historialCultivoRepositoryImpl implements HistorialCultivoRepositoryPort {
    constructor(
        @InjectRepository(historialCultivoOrmEntity)
        private readonly repository: Repository<historialCultivoOrmEntity>, 
    ) {}

    async registrar(historialCultivo: historialCultivo): Promise<historialCultivo> {
        const saved = await this.repository.save(this.toOrm(historialCultivo));
        return this.toDomain(saved);
    }

    async listarPorCultivo(cultivoId: number): Promise<historialCultivo[]> {
        const rows = await this.repository.find({
            where: {cultivoId},
            order: {id: 'DESC'},
        });

        return rows.map((row) => this.toDomain(row));
    }

    private toDomain(row: historialCultivoOrmEntity): historialCultivo {
        return new historialCultivo(
            row.id,
            row.cultivoId,
            row.usuarioId,
            row.motivo,
            row.cambios,
        );
    }

    private toOrm(h: historialCultivo): Partial<historialCultivoOrmEntity> {
        return {
            cultivoId: h.cultivoId,
            usuarioId: h.usuarioId,
            motivo: h.motivo,
            cambios: h.cambios,
        };
    }
}