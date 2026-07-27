import { Inject, Injectable } from "@nestjs/common";
import { actividad_InsumoRepository, actividadInsumoRepositoryPort } from "../../domain/port/actividad-insumo.repository.port";
import { registrarActividadInsumoDto } from "../dto/registrar-actividad-insumo.dto";
import { actividadInsumo } from "../../domain/entities/actividad-insumos.entity";

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