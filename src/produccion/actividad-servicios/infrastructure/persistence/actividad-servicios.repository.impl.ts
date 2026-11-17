import { Inject, Injectable } from "@nestjs/common";
import { actividadServicioRepositoryPort } from "../../domain/ports/actividad-servicios.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { actividadServicioOrmEntity } from "./actividad-servicios.orm-entity";
import { Repository } from "typeorm";
import { actividadServicio } from "../../domain/entities/actividad-servicios.entity";

@Injectable()
    export class actividadServicioRepositoryImpl implements actividadServicioRepositoryPort {
        constructor(
            @InjectRepository(actividadServicioOrmEntity)
            private readonly ormRepo: Repository<actividadServicioOrmEntity> 
        ) {}

        async crear(item: actividadServicio): Promise<actividadServicio> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadServicio | null> {
            const row = await this.ormRepo.findOneBy({ id });
            return row? this.toDomain(row) : null;
        }

        async listarPorActividad(actividadId: number): Promise<actividadServicio[]> {
            const rows = await this.ormRepo.find({ where: {actividadId}});
            return rows.map((r) => this.toDomain(r));
        }

        async actualizar(item: actividadServicio): Promise<actividadServicio> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item; 
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadServicioOrmEntity): actividadServicio {
            return new actividadServicio(
                row.id, 
                row.actividadId, 
                row.nombreServicio, 
                row.proveedorId, 
                row.maquinariaId,
                row.horas, 
                row.precioHora, 
                row.costo
            );
        }

        private toOrm(item: actividadServicio): Partial<actividadServicioOrmEntity> {
            return {
                actividadId: item.actividadId, 
                nombreServicio: item.nombreServicio, 
                proveedorId: item.proveedorId,
                maquinariaId: item.maquinariaId,
                horas: item.horas, 
                precioHora: item.precioHora, 
                costo: item.costo,
            };
        }
    }