import { Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { AccesoIncidenciasService } from "../services/acceso-incidencias.service";

@Injectable()
export class ListarIncidenciasUseCase {
    constructor(private readonly accesoIncidencias: AccesoIncidenciasService) {}

    async ejecutar(alcance: AlcanceDatos, cultivoId?: number) {
        return this.accesoIncidencias.listar(alcance, cultivoId);
    }
}
