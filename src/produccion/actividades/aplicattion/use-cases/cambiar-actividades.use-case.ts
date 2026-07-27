import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividades_repository, actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades, estadoActividad } from "../../domain/entities/actividades.entity";

@Injectable()
    export class cambiarActividadesUseCase {
        constructor(
            @Inject(actividades_repository)
            private readonly actividadesRepository: actividadesRepositoryPort,
        ) {}

        async execute(id: number, nuevoEstado: estadoActividad): Promise<Actividades> {
            const actividades = await this.actividadesRepository.buscarPorId(id);
            if(!actividades) {
                throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
            }

            actividades.cambiarEstado(nuevoEstado);

            return await this.actividadesRepository.actualizar(actividades);
        }
    }