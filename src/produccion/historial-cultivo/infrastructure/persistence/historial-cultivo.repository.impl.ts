import { Injectable } from "@nestjs/common";
import { HistorialCultivoRepositoryPort } from "../../domain/ports/historial-cultivo.port";
import { InjectRepository } from "@nestjs/typeorm";
import { historialCultivoOrmEntity } from "./historial-cultivo.orm-entity";
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
        // El nombre de quien hizo el cambio sale de la tabla de usuarios
        const filas = await this.repository
            .createQueryBuilder('h')
            .leftJoin('usuarios', 'u', 'u.id = h.usuario_id')
            .select([
                'h.id AS id',
                'h.cultivo_id AS "cultivoId"',
                'h.usuario_id AS "usuarioId"',
                'h.motivo AS motivo',
                'h.cambios AS cambios',
                'h.created_at AS fecha',
                "TRIM(CONCAT(u.nombre, ' ', COALESCE(u.apellido, ''))) AS \"usuarioNombre\"",
            ])
            .where('h.cultivo_id = :cultivoId', { cultivoId })
            .andWhere('h.deleted_at IS NULL')
            .orderBy('h.id', 'DESC')
            .getRawMany();

        return filas.map((f) => new historialCultivo(
            f.id, f.cultivoId, f.usuarioId, f.motivo, f.cambios, f.fecha, f.usuarioNombre || null,
        ));
    }

    private toDomain(row: historialCultivoOrmEntity): historialCultivo {
        return new historialCultivo(
            row.id,
            row.cultivoId,
            row.usuarioId,
            row.motivo,
            row.cambios,
            row.createdAt ?? null,
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