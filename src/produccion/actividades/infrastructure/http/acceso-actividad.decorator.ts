import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../modules/iam/infrastructure/http/guards/jwt-auth.guard";
import { PermisosGuard } from "../../../../modules/iam/infrastructure/http/guards/permisos.guard";
import { ActividadVisibleGuard } from "./actividad-visible.guard";

export function AccesoActividad() {
    return applyDecorators(UseGuards(JwtAuthGuard, PermisosGuard, ActividadVisibleGuard));
}
