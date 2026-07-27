import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividades_repository, actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";

@Injectable()
    export class eliminarActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
    ) {}

    async execute(id: number): Promise<void> {
        const actividades = await this.actividadesRepository.buscarPorId(id);
        if (!actividades) {
            throw new NotFoundException (`Actividad con ID ${id} no encontrada`);
        }

        await this.actividadesRepository.eliminar(id);
    }
}