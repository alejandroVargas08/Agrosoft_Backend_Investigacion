import { Inject, Injectable, Optional } from "@nestjs/common";
import { consumirActividadInsumoReservaUseCase } from "../../../actividad-insumos-reserva/application/use-cases/consumir-actividad-insumo-reserva.use-case";
import { registrarInsumoUsoDto } from "../dto/registrar-insumo-uso.dto";
import { actividadInsumoUso } from "../../domain/entities/actividad-insumos-uso.entity";
import { actividad_InsumoUsoRepository, actividadInsumoUsoRepositoryPort } from "../../domain/ports/actividad-insumos-uso.repository.port";

@Injectable()
    export class registrarInsumoUseCase {
        constructor(
            @Inject(actividad_InsumoUsoRepository)
            private readonly repo: actividadInsumoUsoRepositoryPort,
            @Optional()
            private readonly consumirReserva?: consumirActividadInsumoReservaUseCase,
        ) {}

        async ejecutar(actividadId: number, dto:registrarInsumoUsoDto): Promise<actividadInsumoUso> {
            const uso = actividadInsumoUso.crear({
                actividadId,
                insumoId: dto.insumoId,
                cantidadUso: dto.cantidadUso,
                costoUnitarioUso: dto.costoUnitarioUso,
            });

            const guardado = await this.repo.crear(uso);
            if (this.consumirReserva) {
                await this.consumirReserva.ejecutar(
                    actividadId,
                    dto.insumoId,
                    dto.cantidadUso
                );
            }

            return guardado;
        }
    }