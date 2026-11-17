import { Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";

@Injectable()
export class ObtenerCultivoUseCase {
    constructor(private readonly accesoCultivos: AccesoCultivosService) {}

    async ejecutar(id: number, alcance: AlcanceDatos): Promise<Cultivo> {
        return this.accesoCultivos.obtenerCultivoVisible(id, alcance);
    }
}
