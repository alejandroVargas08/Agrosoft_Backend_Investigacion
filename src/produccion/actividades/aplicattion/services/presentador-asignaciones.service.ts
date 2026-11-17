import { Inject, Injectable } from "@nestjs/common";
import { USUARIO_REPOSITORY } from "../../../../modules/iam/domain/ports/usuario.repository.token";
import type { UsuarioRepositoryPort } from "../../../../modules/iam/domain/ports/usuario.repository.port";
import { ActividadAsignacion } from "../../domain/entities/actividad-asignacion.entity";
import { Actividades } from "../../domain/entities/actividades.entity";
import { actividades_repository } from "../../domain/ports/actividades.repository.port";
import type { actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";

export interface PersonaResumen {
    id: number;
    nombre: string;
    apellido: string;
}

export interface ActividadResumen {
    id: number;
    nombre: string;
    tipo: string;
    subtipo: string | null;
    descripcion: string;
    fecha: Date;
    loteId: number;
    subLoteId: number | null;
    cultivoId: number;
    estado: string;
}

export interface AsignacionRespuesta {
    id: number;
    estado: string;
    vencida: boolean;
    fechaLimite: Date | null;
    horasTrabajadas: number | null;
    comentarioAprendiz: string | null;
    comentarioInstructor: string | null;
    iniciadaEn: Date | null;
    entregadaEn: Date | null;
    revisadaEn: Date | null;
    creadoEn: Date | null;
    aprendiz: PersonaResumen | null;
    asignadoPor: PersonaResumen | null;
    actividad: ActividadResumen | null;
}

@Injectable()
export class PresentadorAsignacionesService {
    constructor(
        @Inject(actividades_repository) private readonly actividades: actividadesRepositoryPort,
        @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
    ) {}

    async presentar(asignaciones: ActividadAsignacion[]): Promise<AsignacionRespuesta[]> {
        const actividadesPorId = new Map<number, Actividades | null>();
        const personasPorId = new Map<number, PersonaResumen | null>();

        for (const asignacion of asignaciones) {
            if (!actividadesPorId.has(asignacion.actividadId)) {
                actividadesPorId.set(asignacion.actividadId, await this.actividades.buscarPorId(asignacion.actividadId));
            }
            for (const usuarioId of [asignacion.aprendizId, asignacion.asignadoPorId]) {
                if (!personasPorId.has(usuarioId)) {
                    personasPorId.set(usuarioId, await this.persona(usuarioId));
                }
            }
        }

        return asignaciones.map((asignacion) => {
            const actividad = actividadesPorId.get(asignacion.actividadId) ?? null;
            return {
                id: asignacion.id!,
                estado: asignacion.estado,
                vencida: asignacion.estaVencida(),
                fechaLimite: asignacion.fechaLimite,
                horasTrabajadas: asignacion.horasTrabajadas,
                comentarioAprendiz: asignacion.comentarioAprendiz,
                comentarioInstructor: asignacion.comentarioInstructor,
                iniciadaEn: asignacion.iniciadaEn,
                entregadaEn: asignacion.entregadaEn,
                revisadaEn: asignacion.revisadaEn,
                creadoEn: asignacion.creadoEn ?? null,
                aprendiz: personasPorId.get(asignacion.aprendizId) ?? null,
                asignadoPor: personasPorId.get(asignacion.asignadoPorId) ?? null,
                actividad: actividad
                    ? {
                        id: actividad.id!,
                        nombre: actividad.nombre,
                        tipo: actividad.tipo,
                        subtipo: actividad.subtipo,
                        descripcion: actividad.descripcion,
                        fecha: actividad.fecha,
                        loteId: actividad.loteId,
                        subLoteId: actividad.subLoteId,
                        cultivoId: actividad.cultivoId,
                        estado: actividad.estado,
                    }
                    : null,
            };
        });
    }

    private async persona(usuarioId: number): Promise<PersonaResumen | null> {
        const usuario = await this.usuarios.buscarPorId(usuarioId);
        if (!usuario) return null;
        return { id: usuario.obtenerId(), nombre: usuario.obtenerNombre(), apellido: usuario.obtenerApellido() };
    }
}
