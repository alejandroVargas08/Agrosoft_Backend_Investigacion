import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";

@Injectable()
export class finalizarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async ejecutar(id: number, fechaFinalizacion: Date, alcance: AlcanceDatos): Promise<Cultivo> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(id, alcance);
        cultivo.finalizar(fechaFinalizacion);
        return this.cultivoRepo.actualizar(cultivo);
    }
}
