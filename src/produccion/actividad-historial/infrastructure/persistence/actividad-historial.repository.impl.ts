import { Injectable } from "@nestjs/common";
import { actividadHistorialRepositoryPort } from "../../domain/ports/actividad-historial.repository.port";
import { Repository } from "typeorm";
import { actividadHistorialOrmEntity } from "./actividad-historial.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { actividadHistorial } from "../../domain/entities/actividad-historial.entity";

@Injectable()
    export class actividadHistorialRepositoryImpl implements actividadHistorialRepositoryPort {
        constructor(
            @InjectRepository(actividadHistorialOrmEntity)
            private readonly repository: Repository<actividadHistorialOrmEntity>,
        ) {}

        async crear(registro: actividadHistorial): Promise<actividadHistorial> {
            const OrmEntity = this.repository.create({
                actividadId: registro.actividadId,
                cultivoId: registro.cultivoId,
                usuarioId: registro.usuarioId,
                motivo: registro.motivo,
                cambios: registro.cambios,
                fecha: registro.fecha,
            });
            const saved = await this.repository.save(OrmEntity);
            return this.toDomain(saved);
        }

        async listarPorActividad(actividadId: number): Promise<actividadHistorial[]> {
            const entities = await this.repository.find({where: { actividadId}});
            return entities.map((e) => this.toDomain(e));
        }

        private toDomain(entity: actividadHistorialOrmEntity): actividadHistorial {
            return new actividadHistorial(
                entity.id,
                entity.actividadId,
                entity.cultivoId,
                entity.usuarioId,
                entity.motivo,
                entity.cambios,
                entity.fecha,
            ); 
        }
    } 