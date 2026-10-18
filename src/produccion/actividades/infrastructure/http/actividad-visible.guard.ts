import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { AccesoActividadesService } from "../../aplicattion/services/acceso-actividades.service";

interface SolicitudConActividad {
    method: string;
    params: Record<string, string | undefined>;
    body?: { actividadId?: unknown };
    usuarioAutenticado?: UsuarioAutenticado;
}

@Injectable()
export class ActividadVisibleGuard implements CanActivate {
    constructor(private readonly accesoActividades: AccesoActividadesService) {}

    async canActivate(contexto: ExecutionContext): Promise<boolean> {
        const solicitud = contexto.switchToHttp().getRequest<SolicitudConActividad>();
        const usuario = solicitud.usuarioAutenticado;
        if (!usuario) throw new UnauthorizedException();

        const permiso = solicitud.method === 'GET'
            ? PERMISOS_PRODUCCION.VER_ACTIVIDADES
            : PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES;
        if (!usuario.permisos.includes(permiso)) {
            throw new ForbiddenException(`No tienes permiso para esta acción (${permiso})`);
        }

        const valor = solicitud.params.actividadId ?? solicitud.body?.actividadId;
        const actividadId = Number(valor);
        if (!Number.isInteger(actividadId) || actividadId <= 0) {
            throw new BadRequestException('Falta un actividadId válido');
        }

        await this.accesoActividades.obtenerActividadVisible(actividadId, usuario);
        return true;
    }
}
