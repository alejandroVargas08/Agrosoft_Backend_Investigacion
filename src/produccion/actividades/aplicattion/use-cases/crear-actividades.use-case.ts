import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../services/acceso-actividades.service";

export interface crearActividadesDto {
    nombre: string;
    tipo: string;
    subtipo?: string | null;
    loteId: number;
    subLoteId?: number | null;
    cultivoId: number;
    fecha: Date;
    horasActividad: number;
    precioHoraActividad: number;
    descripcion: string;
    cantidadPlantas: number | null;
    productoAgroId: number | null;
}

@Injectable()
export class crearActividadesUseCase {
    constructor(
        @Inject(actividades_repository)
        private readonly actividadesRepository: actividadesRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async execute(dto: crearActividadesDto, usuarioId: number, alcance: AlcanceDatos): Promise<Actividades> {
        await this.accesoActividades.validarCultivoDelLote(dto.cultivoId, dto.loteId, alcance);

        const nuevaActividad = Actividades.crear({
            nombre: dto.nombre,
            tipo: dto.tipo,
            subtipo: dto.subtipo,
            loteId: dto.loteId,
            subLoteId: dto.subLoteId,
            cultivoId: dto.cultivoId,
            fecha: dto.fecha,
            horasActividad: dto.horasActividad,
            precioHoraActividad: dto.precioHoraActividad,
            descripcion: dto.descripcion,
            creadoPorUsuarioId: usuarioId,
            cantidadPlantas: dto.cantidadPlantas,
            productoAgroId: dto.productoAgroId,
        });

        return await this.actividadesRepository.crear(nuevaActividad);
    }
}
