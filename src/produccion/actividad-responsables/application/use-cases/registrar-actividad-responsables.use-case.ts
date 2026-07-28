import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { actividad_ResponsableRepository } from "../../domain/ports/actividad-responsable.port";
import { registrarActividadResponsableDto } from "../dto/registrar-actividad-responsables.dto";
import { actividadResponsable } from "../../domain/entities/actividad-responsable.entity";

@Injectable()
    export class registrarActividadResponsableUseCase {
        constructor(
            @Inject(actividad_ResponsableRepository)
            private readonly repo: actividadResponsableRepositoryPort,
        ) {}

        async ejecutar(actividadId: number, dto: registrarActividadResponsableDto): Promise<actividadResponsable> {
            const yaExiste = await this.repo.existePorActividadUsuario(actividadId, dto.usuarioId);
            if (yaExiste) {
                throw new ConflictException('Este usuario ya está registrado como responsable de esta actividad');
            }

            const item = actividadResponsable.crear({
                actividadId,
                usuarioId: dto.usuarioId,
                horas: dto.horas,
                precioHora: dto.precioHora,
            });

            return this.repo.crear(item);
        }
    }