import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { CrearCultivoDto } from "../dtos/crear-cultivo.dto";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";

@Injectable()
export class CrearCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async ejecutar(dto: CrearCultivoDto, alcance: AlcanceDatos): Promise<Cultivo> {
        await this.accesoCultivos.validarLote(dto.loteId, alcance);

        const cultivo = new Cultivo(
            null,
            dto.nombreCultivo,
            dto.tipoCultivo,
            dto.loteId,
            dto.subLoteId ?? null,
            new Date(dto.fechaSiembra),
            null,
            0,
            'activo',
        );
        return this.cultivoRepo.crear(cultivo);
    }
}
