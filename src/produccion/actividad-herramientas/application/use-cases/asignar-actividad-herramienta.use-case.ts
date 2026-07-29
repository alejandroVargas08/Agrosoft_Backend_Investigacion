import { Inject, Injectable } from "@nestjs/common";
import { actividad_HerramientasRepository, actividad_HerramientasRepositoryPort } from "../../domain/ports/actividad-herramientas.repository.port";
import { asignarActividadHerramientaDto } from "../dto/asignar-actividad-herramienta.dto";
import { actividadHerramienta } from "../../domain/entities/actividad-herramientas.entity";

@Injectable()
    export class asignarActividadHerramientaUseCase {
        constructor(
            @Inject(actividad_HerramientasRepository)
            private readonly repo: actividad_HerramientasRepositoryPort
        ) {}

        async ejecutar(actividadId: number, dto: asignarActividadHerramientaDto): Promise<actividadHerramienta> {
            const item = actividadHerramienta.crear({
                actividadId,
                insumoId: dto.insumoId,
                activoFijoId: dto.activoFijoId,
                horasEstimadas: dto.horasEstimadas,
            });
            return this.repo.crear(item);
        }
    }