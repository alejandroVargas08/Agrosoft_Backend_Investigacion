import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_ServicioRepository } from "../../domain/ports/actividad-servicios.repository.port";
import { type actividadServicioRepositoryPort } from "../../domain/ports/actividad-servicios.repository.port";

@Injectable()
    export class eliminarActividadServicioUseCase {
        constructor(
            @Inject(actividad_ServicioRepository)
            private readonly repo: actividadServicioRepositoryPort
        ) {}

        async ejecutar(id: number): Promise<void> {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Servicio de actividad ${id} no encontrado`);
            await this.repo.eliminar(id);
        }
    }