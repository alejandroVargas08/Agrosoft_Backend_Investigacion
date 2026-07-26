import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { loteProduccionRepositoryPort } from "../../domain/ports/lotes.produccion.repository.port";
import { LoteProduccionOrmEntity } from "./lote.produccion.orm-entity";
import { loteProduccion } from "../../domain/entities/lotes.produccion.entity";

@Injectable()
export class LoteProduccionRepositoryImpl implements loteProduccionRepositoryPort {
    constructor(
        @InjectRepository(LoteProduccionOrmEntity) 
        private readonly ormRepo: Repository<LoteProduccionOrmEntity>
    ) {}

    async crear(loteProd: loteProduccion): Promise<loteProduccion> {
        const saved = await this.ormRepo.save(this.toOrm(loteProd) as LoteProduccionOrmEntity);
        return this.toDomain(saved);
    }

    async buscarPorId(id: number): Promise<loteProduccion | null> {
        const row = await this.ormRepo.findOneBy({ id });
        if (!row) return null;
        return this.toDomain(row);
    }

    async listarTodos(): Promise<loteProduccion[]> {
        const rows = await this.ormRepo.find();
        return rows.map(row => this.toDomain(row));
    }

    async listarPorCultivo(cultivoId: number): Promise<loteProduccion[]> {
        const rows = await this.ormRepo.find({ where: { cultivoId } });
        return rows.map(row => this.toDomain(row));
    }

    async actualizar(loteProd: loteProduccion): Promise<loteProduccion> {
        await this.ormRepo.update(loteProd.id!, this.toOrm(loteProd));
        return loteProd;
    }

    async eliminar(id: number): Promise<void> {
        await this.ormRepo.delete(id);
    }

    private toDomain(row: LoteProduccionOrmEntity): loteProduccion {
        return new loteProduccion(
            row.id,
            row.productoAgroId,
            row.cultivoId,
            row.loteId,
            row.subLoteId,
            row.actividadesCosechaId,
            row.calidad,
            row.cantidadKg,
            row.stockDisponibleKg,
            row.costoUnitarioKg,
            row.costoTotal,
            row.precioSugeridoKg
        );
    }

    private toOrm(l: loteProduccion): Partial<LoteProduccionOrmEntity> {
        return {
            productoAgroId: l.productoAgroId,
            cultivoId: l.cultivoId,
            loteId: l.loteId,
            subLoteId: l.subLoteId ?? undefined,
            actividadesCosechaId: l.actividadesCosechaId ?? undefined,
            calidad: l.calidad,
            cantidadKg: l.cantidadKg,
            stockDisponibleKg: l.stockDisponibleKg,
            costoUnitarioKg: l.costoUnitarioKg,
            costoTotal: l.costoTotal,
            precioSugeridoKg: l.precioSugeridoKg
        };
    }
}