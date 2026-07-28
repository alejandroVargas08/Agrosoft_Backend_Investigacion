import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividad_evidenciaRepository, actividadEvidenciaRepositoryPort } from "../../domain/ports/actividad-evidencias.repository.port";

@Injectable()
    export class AgregarImagenActividadEvidenciaUseCase {
        constructor(
            @Inject(actividad_evidenciaRepository)
            private readonly repo: actividadEvidenciaRepositoryPort
        ) {}

        async ejecutar(id: number, url: string) {
            const item = await this.repo.buscarPorId(id);
            if (!item) throw new NotFoundException(`Evidencia ${id} no encontrada`);
            item.agregarImagen(url);
            return this.repo.actualizar(item);
        }
    }