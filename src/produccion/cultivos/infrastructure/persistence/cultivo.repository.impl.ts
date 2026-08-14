import { Repository } from "typeorm";
import { CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { CultivoOrmEntity } from "./cultivo.orm-entity";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class CultivoRepositoryImpl implements CultivoRepositoryPort {
    constructor( 
        @InjectRepository(CultivoOrmEntity) private readonly ormRepo: Repository<CultivoOrmEntity>) {}

    async crear(cultivo: Cultivo) : Promise<Cultivo> {
        const saved = await this.ormRepo.save(this.toOrm(cultivo) as CultivoOrmEntity);
        return this.toDomain(saved);
    }

    async buscarPorId(id: number): Promise<Cultivo | null> {
        const row = await this.ormRepo.findOneBy({ id });
        if (!row) return null;
        return this.toDomain(row);
    }

    async listarPorLote(loteId: number): Promise<Cultivo[]> {
        const rows = await this.ormRepo.find({ where: { loteId }});
        return rows.map(row => this.toDomain(row));
    }

    async actualizar(cultivo: Cultivo): Promise<Cultivo> {
        await this.ormRepo.update(cultivo.id!, this.toOrm(cultivo));
        return cultivo;
    }

    async eliminar(id: number): Promise<void> {
        await this.ormRepo.delete(id);
    }

    private toDomain(row: CultivoOrmEntity) : Cultivo {
        return new Cultivo(
            row.id, 
            row.nombreCultivo, 
            row.tipoCultivo, 
            row.loteId, 
            row.subLoteId, 
            row.fechaSiembra, 
            row.fechaFinalizacion, 
            row.costoTotal, 
            row.estado as any
        );
    }
    private toOrm(c: Cultivo) : Partial<CultivoOrmEntity> {
        return { 
            nombreCultivo: c.nombreCultivo, 
            tipoCultivo: c.tipoCultivo, 
            loteId: c.loteId,
            subLoteId: c.subLoteId ?? undefined,
            fechaSiembra: c.fechaSiembra, 
            fechaFinalizacion: c.fechaFinalizacion ?? undefined, 
            costoTotal: c.costoTotal, 
            estado: c.estado 
        };
    }
}