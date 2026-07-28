import { Inject, Injectable } from "@nestjs/common";
import { actividad_ServicioRepository, actividadServicioRepositoryPort } from "../../domain/ports/actividad-servicios.repository.port";
import { registraractividadServicioDto } from "../dto/registrar-actividad-servicio.dto";
import { actividadServicio } from "../../domain/entities/actividad-servicios.entity";

@Injectable()
    export class registrarActividadServicioUseCase {
        constructor(
            @Inject(actividad_ServicioRepository)
            private readonly repo: actividadServicioRepositoryPort
        ) {}

        async ejecutar(actividadId: number, dto: registraractividadServicioDto): Promise<actividadServicio> {
            const item = actividadServicio.crear({
                actividadId, 
                nombreServicio: dto.nombreServicio, 
                proveedorId: dto.proveedorId,
                maquinariaId: dto.maquinariaId, // <-- Agregado
                horas: dto.horas, 
                precioHora: dto.precioHora,
            });
            return this.repo.crear(item);
        }
    }