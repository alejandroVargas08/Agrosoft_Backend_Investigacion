import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";

@Injectable()
export class listarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async ejecutar(loteId: number, alcance: AlcanceDatos): Promise<Cultivo[]> {
        await this.accesoCultivos.validarLote(loteId, alcance);
        return this.cultivoRepo.listarPorLote(loteId);
    }
}
