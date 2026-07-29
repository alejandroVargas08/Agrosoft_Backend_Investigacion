import { Injectable } from "@nestjs/common";
import { usoHerramientaRepositoryPort } from "../../domain/ports/uso-herramienta.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { usoHerramientaOrmEntity } from "./uso-herramienta.orm-entity";
import { usoHerramienta } from "../../domain/entities/uso-herramienta.entity";

@Injectable()
    export class usoHerramientaRepositoryImpl implements usoHerramientaRepositoryPort {
        constructor(
            @InjectRepository(usoHerramientaOrmEntity)
            private readonly ormRepo: Repository<usoHerramientaOrmEntity>,
        ) {}

        async crear(item: usoHerramienta): Promise<usoHerramienta> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async listarPorActividad(actividadId: number): Promise<usoHerramienta[]> {
            const rows = await this.ormRepo.find({
                where: { actividadId },
                order: {fechaUso: 'DESC'},
            });
            return rows.map((row) => this.toDomain(row));
        }

        async obtenerUltimoValorLibros(insumoId: number): Promise<number | null> {
            const ultimo = await this.ormRepo.findOne({
                where: {insumoId},
                order: {fechaUso: 'DESC'},
            });
            return ultimo ? ultimo.valorLibrosDespues: null;
        }

        private toDomain(row: usoHerramientaOrmEntity): usoHerramienta {
            return new usoHerramienta(
                row.id,
                row.actividadId,
                row.insumoId,
                row.horasUsadas,
                row.depreciacionGenerada,
                row.valorLibrosAntes,
                row.valorLibrosDespues,
                row.fechaUso,
            );
        }

        private toOrm(item: usoHerramienta): Partial<usoHerramientaOrmEntity> {
            return {
                actividadId: item.actividadId,
                insumoId: item.insumoId,
                horasUsadas: item.horasUsadas,
                depreciacionGenerada: item.depreciacionGenerada,
                valorLibrosAntes: item.valorLibrosAntes,
                valorLibrosDespues: item.valorLibrosDespues,
                fechaUso: item.fechaUso,
            };
        }
    }