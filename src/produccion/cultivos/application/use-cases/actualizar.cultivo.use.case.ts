import { Inject, Injectable } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";
import type { ActualizarCultivoDto } from "../dtos/actualizar-cultivo.do";
import { registrarCambioHistorialCultivoUseCase } from "../../../historial-cultivo/application/use-cases/registrar-historial-cultivo.use-case";

const dia = (fecha: Date | null) => (fecha ? new Date(fecha).toISOString().slice(0, 10) : null);

@Injectable()
export class ActualizarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
        private readonly registrarHistorial: registrarCambioHistorialCultivoUseCase,
    ) {}

    async ejecutar(id: number, datosActualizados: ActualizarCultivoDto, usuario: UsuarioAutenticado): Promise<Cultivo> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(id, usuario);

        // Cada campo que de verdad cambia queda con su valor de antes y el de después
        const cambios: Record<string, { antes: unknown; despues: unknown }> = {};
        const anotar = (campo: string, antes: unknown, despues: unknown) => {
            if (antes !== despues) cambios[campo] = { antes, despues };
        };

        if (datosActualizados.nombreCultivo) {
            anotar('nombre', cultivo.nombreCultivo, datosActualizados.nombreCultivo);
            cultivo.nombreCultivo = datosActualizados.nombreCultivo;
        }
        if (datosActualizados.tipoCultivo) {
            anotar('tipo', cultivo.tipoCultivo, datosActualizados.tipoCultivo);
            cultivo.tipoCultivo = datosActualizados.tipoCultivo;
        }
        if (datosActualizados.fechaSiembra) {
            const nueva = new Date(datosActualizados.fechaSiembra);
            anotar('inicio', dia(cultivo.fechaSiembra), dia(nueva));
            cultivo.fechaSiembra = nueva;
        }
        if (datosActualizados.subLoteId !== undefined) {
            anotar('sublote', cultivo.subLoteId, datosActualizados.subLoteId ?? null);
            cultivo.subLoteId = datosActualizados.subLoteId ?? null;
        }
        if (datosActualizados.areaM2 !== undefined) {
            anotar('área (m²)', cultivo.areaM2, datosActualizados.areaM2 ?? null);
            cultivo.areaM2 = datosActualizados.areaM2 ?? null;
        }

        const guardado = await this.cultivoRepo.actualizar(cultivo);

        if (Object.keys(cambios).length > 0) {
            await this.registrarHistorial.execute({
                cultivoId: id,
                usuarioId: usuario.id,
                motivo: datosActualizados.motivo?.trim() || 'Edición de la unidad',
                cambios,
            });
        }
        return guardado;
    }
}
