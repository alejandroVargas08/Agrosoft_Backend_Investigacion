import { Inject, Injectable } from "@nestjs/common";
import { registrarActividadInsumoDto } from "../dto/registrar-actividad-insumo.dto";
import { actividadInsumo } from "../../domain/entities/actividad-insumos.entity";
import { actividad_InsumoRepository } from "../../domain/port/actividad-insumo.repository.port";
import { type actividadInsumoRepositoryPort } from "../../domain/port/actividad-insumo.repository.port";

@Injectable()
    export class registrarActividadInsumoUseCase {
        constructor(
            @Inject(actividad_InsumoRepository)
            private readonly repo: actividadInsumoRepositoryPort
        ) {}

        async ejecutar(actividadId: number, dto: registrarActividadInsumoDto): Promise<actividadInsumo> {
            const item = actividadInsumo.crear({
                actividadId, 
                insumoId: dto.insumoId,
                cantidadUsada: dto.cantidadUsada, 
                unidad: dto.unidad,
                costoUnitario: dto.costoUnitario,
            });
            return this.repo.crear(item);
        }
    }