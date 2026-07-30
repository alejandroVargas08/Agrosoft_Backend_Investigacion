import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_ServicioRepository } from "../../domain/ports/actividad-servicios.repository.port";
import { type actividadServicioRepositoryPort } from "../../domain/ports/actividad-servicios.repository.port";

@Injectable()
    export class actualizarActividadServicioUseCase {
        constructor(
            @Inject(actividad_ServicioRepository)
            private readonly repo: actividadServicioRepositoryPort
        ) {}

        async ejecutar(id: number, horas: number) {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Servicio de actividad ${id} no encontrado`);
            item.actualizarHoras(horas);
            return this.repo.actualizar(item);
        }
    }