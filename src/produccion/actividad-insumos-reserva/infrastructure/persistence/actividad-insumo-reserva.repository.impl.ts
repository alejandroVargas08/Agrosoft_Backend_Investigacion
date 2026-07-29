import { InjectRepository } from "@nestjs/typeorm";
import { actividadInsumoReservaRepositoryPort } from "../../domain/ports/actividad-insumos-reserva.repository.ports";
import { actividadInsumoReservaOrmEntity } from "./actividad-insumo-reserva.orm-entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { actividadInsumoReserva } from "../../domain/entities/actividad-insumos-reserva.entity";

@Injectable()
    export class actividadInsumoReservaRepositoryImpl implements actividadInsumoReservaRepositoryPort {
        constructor(
            @InjectRepository(actividadInsumoReservaOrmEntity)
            private readonly ormRepo: Repository<actividadInsumoReservaOrmEntity>,
        ) {}

        async crear(item: actividadInsumoReserva): Promise <actividadInsumoReserva> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<actividadInsumoReserva | null> {
            const row = await this.ormRepo.findOneBy({id});
            return row ? this.toDomain(row) : null;
        }

        async buscarActividadInsumoReserva(actividadId: number, insumoId: number): Promise<actividadInsumoReserva | null> {
            const row = await this.ormRepo.findOneBy({ actividadId, insumoId});
            return row ? this.toDomain(row) : null;
        }

        async listarActividad(actividadId: number): Promise<actividadInsumoReserva[]> {
            const rows = await this.ormRepo.find({ where: {actividadId}});
            return rows.map((r) => this.toDomain(r));
        }

        async actualizar(item: actividadInsumoReserva): Promise<actividadInsumoReserva> {
            await this.ormRepo.update(item.id!, this.toOrm(item));
            return item;
        }

        async eliminar(id: number): Promise<void> {
            await this.ormRepo.softDelete(id);
        }

        private toDomain(row: actividadInsumoReservaOrmEntity): actividadInsumoReserva {
            return new actividadInsumoReserva(
                row.id,
                row.actividadId,
                row.insumoId,
                row.cantidadReservada
            );
        }

        private toOrm(item: actividadInsumoReserva): Partial<actividadInsumoReservaOrmEntity> {
            return {
                actividadId: item.actividadId,
                insumoId: item.insumoId,
                cantidadReservada: item.cantidadReservada
            };
        }
    }