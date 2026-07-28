import { Injectable } from "@nestjs/common";
import { actividadResponsableRepositoryPort } from "../../domain/ports/actividad-responsable.port";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { actividadResponsableOrmEntity } from "./actividad-responsables.orm-entity";
import { actividadResponsable } from "../../domain/entities/actividad-responsable.entity";

@Injectable()
    export class actividadResponsablesRepositoryImpl implements actividadResponsableRepositoryPort {
        constructor(
            @InjectRepository(actividadResponsablesOrmEntity)
            private readonly ormRepo: Repository<actividadResponsableOrmEntity>
        ) {}

        async crear(item: actividadResponsable): Promise<actividadResponsable> {
        const saved = await this.ormRepo.save(this.toOrm(item));
        return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadResponsable | null> {
            const row = await this.ormRepo.findOneBy({ id });
            return row ? this.toDomain(row) : null;
        }

        async existePorActividadYUsuario(actividadId: number, usuarioId: number): Promise<boolean> {
            const count = await this.ormRepo.count({ where: { actividadId, usuarioId } });
            return count > 0;
        }

        async listarPorActividad(actividadId: number): Promise<actividadResponsable[]> {
            const rows = await this.ormRepo.find({ where: { actividadId } });
            return rows.map((r) => this.toDomain(r));
        }

        async actualizar(item: actividadResponsable): Promise<actividadResponsable> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item;
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadResponsableOrmEntity): actividadResponsable {
            return new actividadResponsable(row.id, row.actividadId, row.usuarioId, row.horas, row.precioHora, row.costo);
        }

        private toOrm(item: actividadResponsable): Partial<actividadResponsableOrmEntity> {
            return { 
                actividadId: item.actividadId, 
                usuarioId: item.usuarioId, 
                horas: item.horas, 
                precioHora: item.precioHora, 
                costo: item.costo 
            };
        }
    }