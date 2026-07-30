import { Inject, Injectable } from "@nestjs/common";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";

@Injectable()
    export class listarActividadesUseCase {
        constructor(
            @Inject(actividades_repository)
            private readonly actividadesRepository: actividadesRepositoryPort,
        ) {}

        async execute(cultivoId: number): Promise<Actividades[]> {
            return await this.actividadesRepository.listarPorCultivo(cultivoId);
        }
    }