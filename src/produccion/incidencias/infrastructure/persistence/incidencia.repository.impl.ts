import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, IsNull, Repository } from "typeorm";
import { IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { Incidencia } from "../../domain/entities/incidencia.entity";
import { IncidenciaOrmEntity } from "./incidencia.orm-entity";

@Injectable()
export class IncidenciaRepositoryImpl implements IncidenciaRepositoryPort {
    constructor(
        @InjectRepository(IncidenciaOrmEntity)
        private readonly ormRepo: Repository<IncidenciaOrmEntity>,
    ) {}

    async crear(incidencia: Incidencia): Promise<Incidencia> {
        const saved = await this.ormRepo.save(this.toOrm(incidencia) as IncidenciaOrmEntity);
        return this.toDomain(saved);
    }

    async buscarPorId(id: number): Promise<Incidencia | null> {
        const row = await this.ormRepo.findOneBy({ id });
        if (!row) return null;
        return this.toDomain(row);
    }

    async listar(cultivoId?: number): Promise<Incidencia[]> {
        const rows = await this.ormRepo.find({
            where: cultivoId ? { cultivoId } : {},
            order: { fecha: 'DESC', id: 'DESC' },
        });
        return rows.map((row) => this.toDomain(row));
    }

    async listarVisibles(cultivoIdsPermitidos: number[] | null, cultivoId?: number): Promise<Incidencia[]> {
        const rows = await this.ormRepo.find({
            where: this.filtroVisibles(cultivoIdsPermitidos, cultivoId),
            order: { fecha: 'DESC', id: 'DESC' },
        });
        return rows.map((row) => this.toDomain(row));
    }

    async idsVisibles(cultivoIdsPermitidos: number[] | null): Promise<number[] | null> {
        if (cultivoIdsPermitidos === null) return null;
        const rows = await this.ormRepo.find({
            select: { id: true },
            where: this.filtroVisibles(cultivoIdsPermitidos),
        });
        return rows.map((row) => row.id);
    }

    private filtroVisibles(
        cultivoIdsPermitidos: number[] | null,
        cultivoId?: number,
    ): FindOptionsWhere<IncidenciaOrmEntity> | FindOptionsWhere<IncidenciaOrmEntity>[] {
        if (cultivoId !== undefined) {
            if (cultivoIdsPermitidos !== null && !cultivoIdsPermitidos.includes(cultivoId)) {
                return { id: -1 };
            }
            return { cultivoId };
        }
        if (cultivoIdsPermitidos === null) return {};
        return [{ cultivoId: IsNull() }, { cultivoId: In(cultivoIdsPermitidos) }];
    }

    async actualizar(incidencia: Incidencia): Promise<Incidencia> {
        await this.ormRepo.update(incidencia.id!, this.toOrm(incidencia));
        return incidencia;
    }

    async eliminar(id: number): Promise<void> {
        await this.ormRepo.softDelete(id);
    }

    private toDomain(row: IncidenciaOrmEntity): Incidencia {
        return new Incidencia(
            row.id,
            row.titulo,
            row.tipo,
            row.severidad as any,
            row.estado as any,
            row.cultivoId ?? null,
            row.fecha,
            row.descripcion ?? null,
            row.creadoPorUsuarioId ?? null,
        );
    }

    private toOrm(i: Incidencia): Partial<IncidenciaOrmEntity> {
        return {
            titulo: i.titulo,
            tipo: i.tipo,
            severidad: i.severidad,
            estado: i.estado,
            cultivoId: i.cultivoId ?? undefined,
            fecha: i.fecha,
            descripcion: i.descripcion ?? undefined,
            creadoPorUsuarioId: i.creadoPorUsuarioId,
        };
    }
}