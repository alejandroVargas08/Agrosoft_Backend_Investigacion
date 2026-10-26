import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { AccesoIncidenciasService } from "../../../incidencias/application/services/acceso-incidencias.service";
import { Tratamiento } from "../../domain/entities/tratamiento.entity";
import { Tratamiento_Repository } from "../../domain/ports/tratamiento.repository.port";
import { type TratamientoRepositoryPort } from "../../domain/ports/tratamiento.repository.port";
import { CrearTratamientoDto } from "../dtos/crear-tratamiento.dto";

@Injectable()
export class CrearTratamientoUseCase {
    constructor(
        @Inject(Tratamiento_Repository) private readonly tratamientoRepo: TratamientoRepositoryPort,
        private readonly accesoIncidencias: AccesoIncidenciasService,
    ) {}

    async ejecutar(dto: CrearTratamientoDto, usuario: UsuarioAutenticado): Promise<Tratamiento> {
        const incidenciaId = dto.incidenciaId ?? null;
        if (!(await this.accesoIncidencias.puedeVerIncidencia(incidenciaId, usuario))) {
            throw new NotFoundException(`No existe la incidencia con id ${incidenciaId}`);
        }

        const tratamiento = new Tratamiento(
            null,
            incidenciaId,
            dto.producto,
            dto.dosis ?? null,
            dto.fecha ? new Date(dto.fecha) : new Date(),
            dto.costo ?? 0,
            dto.notas ?? null,
            'scheduled',
            usuario.id,
        );
        return this.tratamientoRepo.crear(tratamiento);
    }
}
