import { Inject, Injectable } from "@nestjs/common";
import { actividad_evidenciaRepository, actividadEvidenciaRepositoryPort } from "../../domain/ports/actividad-evidencias.repository.port";
import { registrarActividadEvidenciaDto } from "../dto/registrar-actividad-evidencia.dto";
import { actividadEvidencia } from "../../domain/entities/actividad-evidencia.entity";

@Injectable()
    export class registrarActividadEvidenciaUseCase {
        constructor(
            @Inject(actividad_evidenciaRepository)
            private readonly repo: actividadEvidenciaRepositoryPort
        ) {}

        async ejecutar(actividadId: number, dto: registrarActividadEvidenciaDto): Promise<actividadEvidencia> {
            const item = actividadEvidencia.crear({
                actividadId,
                descripcion: dto.descripcion,
                imagenes: dto.imagenes,
            });
            return this.repo.crear(item);
        }
    }