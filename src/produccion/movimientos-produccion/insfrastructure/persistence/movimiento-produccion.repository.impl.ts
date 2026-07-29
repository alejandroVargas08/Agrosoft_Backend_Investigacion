import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { movimientoProduccion, tipoMovimientoProduccion } from "../../domain/entities/movimiento-produccion.entity";
import { movimientoProduccionOrmEntity } from "./movimiento-produccion.orm-entity";
import { Repository } from "typeorm";

@Injectable()
    export class movimientoProduccionRepositoryImpl implements movimientoProduccionRepositoryPort {
        constructor(
            @InjectRepository(movimientoProduccionOrmEntity)
            private readonly ormRepo: Repository<movimientoProduccionOrmEntity>,
        ) {}

        async crear(item: movimientoProduccion): Promise<movimientoProduccion> {
            const saved = await this.ormRepo.save(this.toOrm(item));
            return this.toDomain(saved);
        }

        async listarLoteProduccion(loteProduccionId: number): Promise<movimientoProduccion[]> {
            const rows = await this.ormRepo.find({ where: {loteProduccionId}, order: { fecha: 'DESC' } });
            return rows.map((r) => this.toDomain(r));
        }

        private toDomain(row: movimientoProduccionOrmEntity): movimientoProduccion {
            return new movimientoProduccion(
                row.id, 
                row.loteProduccionId, 
                row.tipo as tipoMovimientoProduccion, 
                row.cantidadKg,
                row.costoUnitarioKg, 
                row.precioUnitarioKg, 
                row.costoTotal,
                row.ventaId, 
                row.descripcion, 
                row.usuarioId, 
                row.fecha,
            );          
        }

        private toOrm(item: movimientoProduccion): Partial<movimientoProduccionOrmEntity> {
            return {
                loteProduccionId: item.loteProduccionId, 
                tipo: item.tipo, 
                cantidadKg: item.cantidadKg,
                costoUnitarioKg: item.costoUnitarioKg, 
                precioUnitarioKg: item.precioUnitarioKg,
                costoTotal: item.costoTotal, 
                ventaId: item.ventaId ?? undefined,
                descripcion: item.descripcion ?? undefined, 
                usuarioId: item.usuarioId, 
                fecha: item.fecha,
                };
        }
    }