import { Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Actividades } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

@Injectable()
export class listarActividadesUseCase {
    constructor(private readonly accesoActividades: AccesoActividadesService) {}

    /** Sin cultivoId lista todo lo que el usuario alcanza; con él, solo ese cultivo. */
    async execute(alcance: AlcanceDatos, cultivoId?: number): Promise<Actividades[]> {
        return this.accesoActividades.listar(alcance, cultivoId);
    }
}
