import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { AccesoCultivosService } from "../../../cultivos/application/services/acceso-cultivos.service";
import { Incidencia } from "../../domain/entities/incidencia.entity";
import { Incidencia_Repository } from "../../domain/ports/incidencia.repository.port";
import type { IncidenciaRepositoryPort } from "../../domain/ports/incidencia.repository.port";

@Injectable()
export class AccesoIncidenciasService {
    constructor(
        @Inject(Incidencia_Repository) private readonly incidenciaRepo: IncidenciaRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async validarCultivo(cultivoId: number | null, alcance: AlcanceDatos): Promise<void> {
        if (!(await this.accesoCultivos.puedeVerCultivo(cultivoId, alcance))) {
            throw new NotFoundException(`Cultivo con ID ${cultivoId} no encontrado`);
        }
    }

    async obtenerIncidenciaVisible(id: number, alcance: AlcanceDatos): Promise<Incidencia> {
        const incidencia = await this.incidenciaRepo.buscarPorId(id);
        if (!incidencia || !(await this.accesoCultivos.puedeVerCultivo(incidencia.cultivoId, alcance))) {
            throw new NotFoundException(`No existe la incidencia con id ${id}`);
        }
        return incidencia;
    }

    async puedeVerIncidencia(incidenciaId: number | null, alcance: AlcanceDatos): Promise<boolean> {
        if (incidenciaId === null) return true;
        const incidencia = await this.incidenciaRepo.buscarPorId(incidenciaId);
        return incidencia !== null && (await this.accesoCultivos.puedeVerCultivo(incidencia.cultivoId, alcance));
    }

    async idsAccesibles(alcance: AlcanceDatos): Promise<number[] | null> {
        const cultivoIds = await this.accesoCultivos.idsAccesibles(alcance);
        return this.incidenciaRepo.idsVisibles(cultivoIds);
    }

    async listar(alcance: AlcanceDatos, cultivoId?: number): Promise<Incidencia[]> {
        const cultivoIds = await this.accesoCultivos.idsAccesibles(alcance);
        return this.incidenciaRepo.listarVisibles(cultivoIds, cultivoId);
    }
}
