import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

export interface actualizarActividadesDto {
    nombre?: string;
    tipo?: string;
    subtipo?: string | null;
    loteId?: number;
    subLoteId?: number | null;
    cultivoId?: number;
    fecha?: Date;
    horasActividad?: number;
    precioHoraActividad?: number;
    descripcion?: string;
    cantidadPlantas?: number | null;
    productoAgroId?: number | null;
}

@Injectable()
export class actualizarActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async execute(id: number, dto: actualizarActividadesDto, alcance: AlcanceDatos): Promise<Actividades> {
        const actividades = await this.accesoActividades.obtenerActividadVisible(id, alcance);

        if (dto.loteId !== undefined || dto.cultivoId !== undefined) {
            await this.accesoActividades.validarCultivoDelLote(
                dto.cultivoId ?? actividades.cultivoId,
                dto.loteId ?? actividades.loteId,
                alcance,
            );
        }

        if (dto.horasActividad !== undefined && dto.precioHoraActividad !== undefined) {
            actividades.actualizarHorasPrecio(dto.horasActividad, dto.precioHoraActividad);
        }

        const editable = actividades as unknown as Record<string, unknown>;
        if (dto.nombre !== undefined) editable.nombre = dto.nombre;
        if (dto.tipo !== undefined) editable.tipo = dto.tipo;
        if (dto.subtipo !== undefined) editable.subtipo = dto.subtipo;
        if (dto.loteId !== undefined) editable.loteId = dto.loteId;
        if (dto.subLoteId !== undefined) editable.subLoteId = dto.subLoteId;
        if (dto.cultivoId !== undefined) editable.cultivoId = dto.cultivoId;
        if (dto.fecha !== undefined) editable.fecha = dto.fecha;
        if (dto.descripcion !== undefined) editable.descripcion = dto.descripcion;
        if (dto.cantidadPlantas !== undefined) editable.cantidadPlantas = dto.cantidadPlantas;
        if (dto.productoAgroId !== undefined) editable.productoAgroId = dto.productoAgroId;

        return await this.actividadesRepository.actualizar(actividades);
    }
}
