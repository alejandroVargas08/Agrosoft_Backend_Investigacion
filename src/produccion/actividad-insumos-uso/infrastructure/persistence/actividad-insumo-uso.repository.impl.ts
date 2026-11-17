import { Injectable } from "@nestjs/common";
import { actividadInsumoUsoRepositoryPort } from "../../domain/ports/actividad-insumos-uso.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { actividadInsumoUsoOrmEntity } from "./actividad-insumo-uso.orm-entity";
import { Repository } from "typeorm";
import { actividadInsumoUso } from "../../domain/entities/actividad-insumos-uso.entity";

@Injectable()
    export class actividadInsumoUsoRepositoryImpl implements actividadInsumoUsoRepositoryPort {
        constructor(
            @InjectRepository(actividadInsumoUsoOrmEntity)
            private readonly ormRepo: Repository<actividadInsumoUsoOrmEntity>,
        ) {}

        async crear(item: actividadInsumoUso): Promise<actividadInsumoUso> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadInsumoUso | null> {
            const row = await this.ormRepo.findOneBy({id});
            return row ? this.toDomain(row) : null;
        }

        async listarActividad(actividadId: number): Promise<actividadInsumoUso[]> {
            const rows = await this.ormRepo.find({ where: {actividadId}});
            return rows.map((r) => this.toDomain(r));
        }

        async actualizar(item: actividadInsumoUso): Promise<actividadInsumoUso> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item;
        }

        private toDomain(row: actividadInsumoUsoOrmEntity): actividadInsumoUso {
            return new actividadInsumoUso(
                row.id,
                row.actividadId,
                row.insumoId,
                row.cantidadUso,
                row.costoUnitarioUso,
                row.costoTotal,
                row.movimientoInsumoId
            );
        }

        private toOrm(item: actividadInsumoUso): Partial<actividadInsumoUsoOrmEntity> {
            return {
                actividadId: item.actividadId,
                insumoId: item.insumoId,
                cantidadUso: item.cantidadUso,
                costoUnitarioUso: item.costoUnitarioUso,
                costoTotal: item.costoTotal,
                movimientoInsumoId: item.movimientoInsumoId ?? undefined,
            };
        }
    }