import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { actividadEvidenciaOrmEntity } from "./actividad-evidencia.orm-entity";
import { Repository } from "typeorm";
import { actividadEvidencia } from "../../domain/entities/actividad-evidencia.entity";

@Injectable()
    export class actividadEvidenciaRepositoryImpl implements ActividadEvidenciaRepositoryPort {
        constructor(
            @InjectRepository(actividadEvidenciaOrmEntity)
            private readonly ormRepo: Repository<actividadEvidenciaOrmEntity>
        ) {}

        async crear(item: actividadEvidencia): Promise<actividadEvidencia> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadEvidencia | null> {
            const row = await this.ormRepo.findOneBy({ id });
            return row ? this.toDomain(row) : null; 
        }

        async listarPorActividad(actividadId: number): Promise<actividadEvidencia[]> {
            const rows = await this.ormRepo.find({ where: {actividadId}});
            return rows.map((r) => this.toDomain(r));
        }

        async actualizar(item: actividadEvidencia): Promise<actividadEvidencia> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item;
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadEvidenciaOrmEntity): actividadEvidencia {
            return new actividadEvidencia(
                row.id, 
                row.actividadId,
                row.descripcion,
                row.imagenes ?? 
                []);
        }

        private toOrm(item: actividadEvidencia): Partial<actividadEvidenciaOrmEntity> {
            return {
                actividadId: item.actividadId,
                descripcion: item.descripcion ?? undefined,
                imagenes: item.imagenes
            };
        }
    }