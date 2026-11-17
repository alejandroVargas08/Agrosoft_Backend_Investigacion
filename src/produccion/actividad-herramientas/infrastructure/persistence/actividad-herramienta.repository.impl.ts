import { Injectable } from "@nestjs/common";
import { actividad_HerramientasRepositoryPort } from "../../domain/ports/actividad-herramientas.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { actividadHerramientaOrmEntity } from "./actividad-herramienta.orm-entity";
import { actividadHerramienta } from "../../domain/entities/actividad-herramientas.entity";

@Injectable()
    export class actividadHerramientaRepositoryImpl implements actividad_HerramientasRepositoryPort {
        constructor(
            @InjectRepository(actividadHerramientaOrmEntity)
            private readonly ormRepo: Repository<actividadHerramientaOrmEntity>,
        ) {}

        async crear(item: actividadHerramienta): Promise<actividadHerramienta> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadHerramienta | null> {
            const row = await this.ormRepo.findOneBy({id});
            return row ? this.toDomain(row) : null; 
        }

        async listarPorActividad(actividadId: number): Promise<actividadHerramienta[]> {
            const rows = await this.ormRepo.findBy({ actividadId});
            return rows.map(row => this.toDomain(row));
        }

        async actualizar(item: actividadHerramienta): Promise<actividadHerramienta> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item;
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadHerramientaOrmEntity): actividadHerramienta {
            return new actividadHerramienta(
                row.id,
                row.actividadId,
                row.insumoId,
                row.activoFijoId,
                row.horasEstimadas
            ); 
        }

        private toOrm(item: actividadHerramienta): Partial<actividadHerramientaOrmEntity> {
            return {
                actividadId: item.actividadId,
                insumoId: item.insumoId,
                activoFijoId: item.activoFijoId ?? undefined,
                horasEstimadas: item.horasEstimadas,
            };
        }
    }