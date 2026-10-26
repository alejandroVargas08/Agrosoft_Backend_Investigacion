import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { ACCESO_LOTES_PORT } from "../../../../modules/territorio/domain/ports/acceso-lotes.port";
import type { AccesoLotesPort } from "../../../../modules/territorio/domain/ports/acceso-lotes.port";
import { AccesoCultivosService } from "../../../cultivos/application/services/acceso-cultivos.service";
import { Actividades } from "../../domain/entities/actividades.entity";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import type { actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";

@Injectable()
export class AccesoActividadesService {
    constructor(
        @Inject(actividades_repository) private readonly actividadesRepository: actividadesRepositoryPort,
        @Inject(ACCESO_LOTES_PORT) private readonly accesoLotes: AccesoLotesPort,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    async obtenerActividadVisible(id: number, alcance: AlcanceDatos): Promise<Actividades> {
        const actividad = await this.actividadesRepository.buscarPorId(id);
        if (!actividad || !(await this.accesoLotes.puedeAcceder(alcance, actividad.loteId))) {
            throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
        }
        return actividad;
    }

    async validarCultivoDelLote(cultivoId: number, loteId: number, alcance: AlcanceDatos): Promise<void> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(cultivoId, alcance);
        if (cultivo.loteId !== loteId) {
            throw new BadRequestException(`El cultivo ${cultivoId} no pertenece al lote ${loteId}`);
        }
    }

    async validarCultivo(cultivoId: number, alcance: AlcanceDatos): Promise<void> {
        await this.accesoCultivos.obtenerCultivoVisible(cultivoId, alcance);
    }

    /** Sin cultivoId devuelve todas las actividades de los lotes que el usuario alcanza. */
    async listar(alcance: AlcanceDatos, cultivoId?: number): Promise<Actividades[]> {
        if (cultivoId !== undefined) await this.validarCultivo(cultivoId, alcance);
        const loteIds = await this.accesoLotes.idsAccesibles(alcance);
        return this.actividadesRepository.listarVisibles(loteIds, cultivoId);
    }
}
