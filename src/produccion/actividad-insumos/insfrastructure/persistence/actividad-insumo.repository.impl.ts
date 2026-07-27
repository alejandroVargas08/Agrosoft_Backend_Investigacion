import { Injectable } from "@nestjs/common";
import { actividadInsumoRepositoryPort } from "../../domain/port/actividad-insumo.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { actividadInsumoOrmEntity } from "./actividad-insumo.orm-entity";
import { Repository } from "typeorm";
import { actividadInsumo } from "../../domain/entities/actividad-insumos.entity";

@Injectable()
    export class actividadInsumoRepositoryImpl implements actividadInsumoRepositoryPort {
        constructor(
            @InjectRepository(actividadInsumoOrmEntity)
            private readonly ormRepo: Repository<actividadInsumoOrmEntity>
        ) {}

        async crear(item: actividadInsumo): Promise<actividadInsumo> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadInsumo | null> {
            const row = await this.ormRepo.findOneBy({id});
            return row ? this.toDomain(row): null;
        }

        async listarPorActividad(actividadId: number): Promise<actividadInsumo[]> {
            const rows = await this.ormRepo.find({where: {actividadId } });
            return rows.map((r) => this.toDomain(r));
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadInsumoOrmEntity): actividadInsumo {
            return new actividadInsumo(
                row.id,
                row.actividadId, 
                row.insumoId, 
                row.cantidadUsada, 
                row.unidad, 
                row.costoUnitario, 
                row.costoTotal
            );
        }

        private toOrm(item: actividadInsumo): Partial<actividadInsumoOrmEntity> {
            return {
                actividadId: item.actividadId, 
                insumoId: item.insumoId,
                cantidadUsada: item.cantidadUsada, 
                unidad: item.unidad,
                costoUnitario: item.costoUnitario, 
                costoTotal: item.costoTotal,
            };
        }
    }