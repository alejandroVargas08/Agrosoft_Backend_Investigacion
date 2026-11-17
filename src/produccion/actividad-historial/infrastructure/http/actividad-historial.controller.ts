import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { registrarActividadHistorialUseCase } from "../../aplicattion/use-cases/registrar-actividad-historial.use-case";
import { listarActividadHistorialUseCase } from "../../aplicattion/use-cases/listar-actividad.historial.use-case";
import { ListarHistorialVisibleUseCase } from "../../aplicattion/use-cases/listar-historial-visible.use-case";
import { crearActividadHistorialDto } from "../../aplicattion/dto/crear-actividad-historial.dto";
import { AccesoActividad } from '../../../actividades/infrastructure/http/acceso-actividad.decorator';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { PERMISOS_PRODUCCION } from '../../../permisos-produccion';

/**
 * El decorador AccesoActividad va por metodo, no en la clase: su guard exige
 * un actividadId y revienta con 400 si no lo encuentra, asi que el listado
 * general no puede pasar por ahi.
 */
@Controller('actividadHistorial')
    export class actividadHistorialController {
        constructor(
            private readonly registrarCambioUC: registrarActividadHistorialUseCase,
            private readonly listarActividadHistorialUC: listarActividadHistorialUseCase,
            private readonly listarHistorialVisibleUC: ListarHistorialVisibleUseCase,
        ) {}

        @Post()
        @AccesoActividad()
        async crear(@Body() dto: crearActividadHistorialDto) {
            return await this.registrarCambioUC. ejecutar(dto);
        }

        /** Todo el historial que el usuario puede ver, lo mas reciente primero. */
        @Get()
        @Autenticado(PERMISOS_PRODUCCION.VER_ACTIVIDADES)
        async listarTodo(
            @UsuarioActual() usuario: UsuarioAutenticado,
            @Query('limite') limite?: string,
        ) {
            const tope = Number(limite);
            return await this.listarHistorialVisibleUC.ejecutar(
                usuario,
                Number.isInteger(tope) && tope > 0 && tope <= 500 ? tope : undefined,
            );
        }

        @Get('actividad/:actividadId')
        @AccesoActividad()
        async listarActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return await this.listarActividadHistorialUC.ejecutar(actividadId);
        }
    }
