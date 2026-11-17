import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { AccesoActividadesService } from "../../aplicattion/services/acceso-actividades.service";
import { ESTADOS_ACTIVOS_ASIGNACION } from "../../domain/entities/actividad-asignacion.entity";
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from "../../domain/ports/actividad-asignaciones.repository.port";
import type { ActividadAsignacionesRepositoryPort } from "../../domain/ports/actividad-asignaciones.repository.port";
import { PERMITE_EJECUTOR } from "./permitir-ejecutor.decorator";

interface SolicitudConActividad {
    method: string;
    params: Record<string, string | undefined>;
    body?: { actividadId?: unknown };
    usuarioAutenticado?: UsuarioAutenticado;
}

@Injectable()
export class ActividadVisibleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly accesoActividades: AccesoActividadesService,
        @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY)
        private readonly asignaciones: ActividadAsignacionesRepositoryPort,
    ) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {
        const solicitud = contexto.switchToHttp().getRequest<SolicitudConActividad>();
        const usuario = solicitud.usuarioAutenticado;
        if (!usuario) throw new UnauthorizedException();

        const valor = solicitud.params.actividadId ?? solicitud.body?.actividadId;
        const actividadId = Number(valor);
        if (!Number.isInteger(actividadId) || actividadId <= 0) {
            throw new BadRequestException('Falta un actividadId válido');
        }

        if (solicitud.method === 'GET') {
            this.exigir(usuario, PERMISOS_PRODUCCION.VER_ACTIVIDADES);
        } else if (!usuario.permisos.includes(PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES)) {
            const permiteEjecutor = this.reflector.getAllAndOverride<boolean>(PERMITE_EJECUTOR, [
                contexto.getHandler(),
                contexto.getClass(),
            ]);
            if (!permiteEjecutor || !usuario.permisos.includes(PERMISOS_PRODUCCION.EJECUTAR_ACTIVIDADES)) {
                throw new ForbiddenException(`No tienes permiso para esta acción (${PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES})`);
            }
            const asignacion = await this.asignaciones.buscarPorActividadYAprendiz(actividadId, usuario.id);
            if (!asignacion || !ESTADOS_ACTIVOS_ASIGNACION.includes(asignacion.estado)) {
                throw new ForbiddenException('Solo puedes registrar datos en tareas que tienes asignadas y sin entregar');
            }
        }

        await this.accesoActividades.obtenerActividadVisible(actividadId, usuario);
        return true;
    }

    private exigir(usuario: UsuarioAutenticado, permiso: string): void {
        if (!usuario.permisos.includes(permiso)) {
            throw new ForbiddenException(`No tienes permiso para esta acción (${permiso})`);
        }
    }
}
