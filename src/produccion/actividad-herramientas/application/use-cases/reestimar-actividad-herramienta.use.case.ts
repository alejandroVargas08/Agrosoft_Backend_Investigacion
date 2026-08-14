import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_HerramientasRepository } from "../../domain/ports/actividad-herramientas.repository.port";
import { type actividad_HerramientasRepositoryPort } from "../../domain/ports/actividad-herramientas.repository.port";

@Injectable()
    export class reEstimarActividadHerramientaUseCase {
        constructor(
            @Inject(actividad_HerramientasRepository)
            private readonly repo: actividad_HerramientasRepositoryPort
        ) {}

        async ejecutar(id: number, horasEstimadas: number ) {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Asignación de herramienta ${id} no encontrada`);
            item.reEstimarHoras(horasEstimadas);
            return this.repo.actualizar(item);
        }
    }