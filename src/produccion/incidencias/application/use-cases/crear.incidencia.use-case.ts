import { Inject, Injectable } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Incidencia } from "../../domain/entities/incidencia.entity";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import { type IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";
import { CrearIncidenciaDto } from "../dtos/crear-incidencia.dto";
import { AccesoIncidenciasService } from "../services/acceso-incidencias.service";

@Injectable()
export class CrearIncidenciaUseCase {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async ejecutar(dto: CrearIncidenciaDto, usuario: UsuarioAutenticado): Promise<Incidencia> {
        await this.accesoIncidencias.validarCultivo(dto.cultivoId ?? null, usuario);

        const incidencia = new Incidencia(
            null,
            dto.titulo,
            dto.tipo,
            dto.severidad,
            'open',
            dto.cultivoId ?? null,
            dto.fecha ? new Date(dto.fecha) : new Date(),
            dto.descripcion ?? null,
            usuario.id,
        );
        return this.incidenciaRepo.crear(incidencia);
    }
}
