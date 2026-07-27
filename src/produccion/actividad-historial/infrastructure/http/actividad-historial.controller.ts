import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { registrarActividadHistorialUseCase } from "../../aplicattion/use-cases/registrar-actividad-historial.use-case";
import { listarActividadHistorialUseCase } from "../../aplicattion/use-cases/listar-actividad.historial.use-case";
import { crearActividadHistorialDto } from "../../aplicattion/dto/crear-actividad-historial.dto";

@Controller('actividadHistorial')
    export class actividadHistorialController {
        constructor(
            private readonly registrarCambioUC: registrarActividadHistorialUseCase,
            private readonly listarActividadHistorialUC: listarActividadHistorialUseCase,
        ) {}

        @Post()
        async crear(@Body() dto: crearActividadHistorialDto) {
            return await this.registrarCambioUC. ejecutar(dto);
        }

        @Get('actividad/:actividadId')
        async listarActividad(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return await this.listarActividadHistorialUC.ejecutar(actividadId);
        }
    }