import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";
import type { ActualizarCultivoDto } from "../dtos/actualizar-cultivo.do";

@Injectable()
export class ActualizarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async ejecutar(id: number, datosActualizados: ActualizarCultivoDto, alcance: AlcanceDatos): Promise<Cultivo> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(id, alcance);

        if (datosActualizados.nombreCultivo) cultivo.nombreCultivo = datosActualizados.nombreCultivo;
        if (datosActualizados.tipoCultivo) cultivo.tipoCultivo = datosActualizados.tipoCultivo;

        // Antes se aceptaban pero se ignoraban en silencio
        if (datosActualizados.fechaSiembra) {
            cultivo.fechaSiembra = new Date(datosActualizados.fechaSiembra);
        }
        if (datosActualizados.subLoteId !== undefined) {
            cultivo.subLoteId = datosActualizados.subLoteId ?? null;
        }

        return this.cultivoRepo.actualizar(cultivo);
    }
}
