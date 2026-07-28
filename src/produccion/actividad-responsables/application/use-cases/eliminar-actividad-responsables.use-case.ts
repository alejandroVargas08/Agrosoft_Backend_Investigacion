import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_ResponsableRepository, actividadResponsableRepositoryPort } from "../../domain/ports/actividad-responsable.port";

@Injectable()
    export class eliminarActividadResponsablesUseCase {
        constructor(
            @Inject(actividad_ResponsableRepository)
            private readonly repo: actividadResponsableRepositoryPort
        ) {}

        async ejecutar(id: number) : Promise<void> {
            const item = await this.repo.buscarPorId(id);
            if(!item) throw new NotFoundException(`Responsable ${id} no encontrado`);
            await this.repo.eliminar(id);
        }
    }