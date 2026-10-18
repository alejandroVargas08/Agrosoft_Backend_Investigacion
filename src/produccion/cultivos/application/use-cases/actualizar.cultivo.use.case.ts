import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";

@Injectable()
export class ActualizarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async ejecutar(id: number, datosActualizados: { nombreCultivo?: string; tipoCultivo?: string }, alcance: AlcanceDatos): Promise<Cultivo> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(id, alcance);

        if (datosActualizados.nombreCultivo) cultivo.nombreCultivo = datosActualizados.nombreCultivo;
        if (datosActualizados.tipoCultivo) cultivo.tipoCultivo = datosActualizados.tipoCultivo;

        return this.cultivoRepo.actualizar(cultivo);
    }
}
