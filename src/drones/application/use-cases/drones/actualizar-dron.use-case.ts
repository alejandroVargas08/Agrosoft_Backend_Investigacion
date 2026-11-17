import { Inject, Injectable } from "@nestjs/common";
import { DRON_REPOSITORY_TOKEN } from "../../../domain/ports/dron.repository.token";
import type { DronRepositoryPort } from "../../../domain/ports/dron.repository.port";
import { ObtenerDronUseCase } from "./obtener-dron.use-case";
import { ActualizarDronDto } from "../../dto/drones/actualizar-dron.dto";
import { Dron } from "../../../domain/entities/dron.entity";


@Injectable()
    export class ActualizarDronUseCase{
        constructor(
            @Inject(DRON_REPOSITORY_TOKEN)
            private readonly dronRepository: DronRepositoryPort,
            private readonly obtenerDronUseCase: ObtenerDronUseCase,

        ){}
        async execute(
            id: number,
            dto: ActualizarDronDto,
        ): Promise<Dron>{
            const dron = await this.obtenerDronUseCase.execute(id);
            const {
                activo,
                numeroSerie,
                ...cambios
            }= dto;
            dron.actualizar({
                ...cambios,
                ...(numeroSerie !== undefined ? {numeroSerie: numeroSerie.trim() || null}:{}),

            });
            if (activo === true) dron.activar();
            if(activo===false) dron.desactivar();
            return this.dronRepository.guardar(dron)
        }
    }
