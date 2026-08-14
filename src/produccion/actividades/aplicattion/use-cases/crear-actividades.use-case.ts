import { Inject, Injectable } from "@nestjs/common";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import { type actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";

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
    creadoPorUsuarioId: number;
    cantidadPlantas: number | null;
    productoAgroId: number | null; 
}

@Injectable()
    export class crearActividadesUseCase {
        constructor(
            @Inject(actividades_repository)
            private readonly actividadesRepository: actividadesRepositoryPort,
        ) {}

        async execute(dto: crearActividadesDto): Promise<Actividades> {
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
                creadoPorUsuarioId: dto.creadoPorUsuarioId,
                cantidadPlantas: dto.cantidadPlantas,
                productoAgroId: dto.productoAgroId,
            });

            return await this.actividadesRepository.crear(nuevaActividad);
        }
    }