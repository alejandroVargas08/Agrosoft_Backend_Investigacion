import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_ResponsableRepository } from "../../domain/ports/actividad-responsable.port";
import { type actividadResponsableRepositoryPort } from "../../domain/ports/actividad-responsable.port";

@Injectable()
    export class actualizarActividadResponsablesUseCase {
        constructor(
            @Inject(actividad_ResponsableRepository)
            private readonly repo: actividadResponsableRepositoryPort
        ) {}

        async ejecutar(id: number, horas: number) {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Responsable ${id} no encontrado`);
            item.actualizarHoras(horas);
            return this.repo.actualizar(item);
        }
    }