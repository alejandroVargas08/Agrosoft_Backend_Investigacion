import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_InsumoRepository } from "../../domain/port/actividad-insumo.repository.port";
import { type actividadInsumoRepositoryPort } from "../../domain/port/actividad-insumo.repository.port";

@Injectable()
    export class eliminarActividadInsumoUseCase {
        constructor(
            @Inject(actividad_InsumoRepository)
            private readonly repo: actividadInsumoRepositoryPort,
        ) {}

        async ejecutar(id: number): Promise<void> {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Registro de insumo ${id} no encontrado`);
            await this.repo.eliminar(id);
        }
    }