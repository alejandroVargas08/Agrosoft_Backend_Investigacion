import { Inject, Injectable } from "@nestjs/common";
import { actividad_ResponsableRepository } from "../../domain/ports/actividad-responsable.port";
import { type actividadResponsableRepositoryPort } from "../../domain/ports/actividad-responsable.port";
import { USUARIO_REPOSITORY } from "../../../../modules/iam/domain/ports/usuario.repository.token";
import type { UsuarioRepositoryPort } from "../../../../modules/iam/domain/ports/usuario.repository.port";

export interface PersonaResumen {
    id: number;
    nombre: string;
    apellido: string;
}

@Injectable()
    export class listarActividadResponsablesUseCase {
        constructor(
            @Inject(actividad_ResponsableRepository)
            private readonly repo: actividadResponsableRepositoryPort,
            @Inject(USUARIO_REPOSITORY)
            private readonly usuarios: UsuarioRepositoryPort,
        ) {}

        async ejecutar(actividadId: number) {
            const responsables = await this.repo.listarPorActividad(actividadId);

            // La tabla solo guarda usuarioId: sin el nombre la pantalla no puede
            // mostrar quien es. Se resuelve aqui, igual que PresentadorAsignacionesService.
            const personasPorId = new Map<number, PersonaResumen | null>();
            for (const responsable of responsables) {
                if (!personasPorId.has(responsable.usuarioId)) {
                    personasPorId.set(responsable.usuarioId, await this.persona(responsable.usuarioId));
                }
            }

            return responsables.map((responsable) => ({
                id: responsable.id,
                actividadId: responsable.actividadId,
                usuarioId: responsable.usuarioId,
                horas: responsable.horas,
                precioHora: responsable.precioHora,
                costo: responsable.costo,
                usuario: personasPorId.get(responsable.usuarioId) ?? null,
            }));
        }

        private async persona(usuarioId: number): Promise<PersonaResumen | null> {
            const usuario = await this.usuarios.buscarPorId(usuarioId);
            if (!usuario) return null;
            return { id: usuario.obtenerId(), nombre: usuario.obtenerNombre(), apellido: usuario.obtenerApellido() };
        }
    }
