import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { actividades_repository, actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { Actividades } from "../../domain/entities/actividades.entity";

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
        ) {}

        async execute(id: number, dto: actualizarActividadesDto): Promise<Actividades> {
            const actividades = await this.actividadesRepository.buscarPorId(id);
            if(!actividades) {
                throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
            }

            if (dto.horasActividades !== undefined && dto.precioHoraActividades !== undefined) {
                actividades.actualizarHorasPrecio(dto.horasActividades, dto.precioHoraActividades);
            }

            if (dto.nombre !== undefined) (actividades as any).nombre = dto.nombre;
            if (dto.tipo !== undefined) (actividades as any).tipo = dto.tipo;
            if (dto.subtipo !== undefined) (actividades as any).subtTip = dto.subtipo; // Ojo con mantener el nombre exacto de tu propiedad
            if (dto.loteId !== undefined) (actividades as any).loteId = dto.loteId;
            if (dto.subLoteId !== undefined) (actividades as any).subLoteId = dto.subLoteId;
            if (dto.cultivoId !== undefined) (actividades as any).cultivoId = dto.cultivoId;
            if (dto.fecha !== undefined) (actividades as any).fecha = dto.fecha;
            if (dto.descripcion !== undefined) (actividades as any).descripcion = dto.descripcion;
            if (dto.cantidadPlantas !== undefined) (actividades as any).cantidadPlantas = dto.cantidadPlantas;
            if (dto.productoAgroId !== undefined) (actividades as any).productoAgroId = dto.productoAgroId;

            return await this.actividadesRepository.actualizar(actividades);
        }
    }