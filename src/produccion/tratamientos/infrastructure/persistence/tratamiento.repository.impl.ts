import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { Tratamiento } from "../../domain/entities/tratamiento.entity";
import { TratamientoOrmEntity } from "./tratamiento.orm-entity";

@Injectable()
export class TratamientoRepositoryImpl implements TratamientoRepositoryPort {
    constructor(
        @InjectRepository(TratamientoOrmEntity)
        private readonly ormRepo: Repository<TratamientoOrmEntity>,
    ) {}

    async crear(tratamiento: Tratamiento): Promise<Tratamiento> {
        const saved = await this.ormRepo.save(this.toOrm(tratamiento) as TratamientoOrmEntity);
        return this.toDomain(saved);
    }

    async buscarPorId(id: number): Promise<Tratamiento | null> {
        const row = await this.ormRepo.findOneBy({ id });
        if (!row) return null;
        return this.toDomain(row);
    }

    /** Todos los tratamientos, o solo los de una incidencia, del más reciente al más antiguo. */
    async listar(incidenciaId?: number): Promise<Tratamiento[]> {
        const rows = await this.ormRepo.find({
            where: incidenciaId ? { incidenciaId } : {},
            order: { fecha: 'DESC', id: 'DESC' },
        });
        return rows.map((row) => this.toDomain(row));
    }

    async actualizar(tratamiento: Tratamiento): Promise<Tratamiento> {
        await this.ormRepo.update(tratamiento.id!, this.toOrm(tratamiento));
        return tratamiento;
    }

    async eliminar(id: number): Promise<void> {
        await this.ormRepo.softDelete(id);
    }

    private toDomain(row: TratamientoOrmEntity): Tratamiento {
        return new Tratamiento(
            row.id,
            row.incidenciaId ?? null,
            row.producto,
            row.dosis ?? null,
            row.fecha,
            Number(row.costo),
            row.notas ?? null,
            row.estado as any,
        );
    }

    private toOrm(t: Tratamiento): Partial<TratamientoOrmEntity> {
        return {
            incidenciaId: t.incidenciaId ?? undefined,
            producto: t.producto,
            dosis: t.dosis ?? undefined,
            fecha: t.fecha,
            costo: t.costo,
            notas: t.notas ?? undefined,
            estado: t.estado,
        };
    }
}