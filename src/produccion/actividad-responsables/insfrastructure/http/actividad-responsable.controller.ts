import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { registrarActividadResponsableUseCase } from "../../application/use-cases/registrar-actividad-responsables.use-case";
import { listarActividadResponsablesUseCase } from "../../application/use-cases/listar-actividad-responsables.use-case";
import { actualizarActividadResponsablesUseCase } from "../../application/use-cases/actualizar-actividad-resposables.use-case";
import { eliminarActividadResponsablesUseCase } from "../../application/use-cases/eliminar-actividad-responsables.use-case";
import { registrarActividadResponsableDto } from "../../application/dto/registrar-actividad-responsables.dto";
import { actualizarActividadResponsableDto } from "../../application/dto/actualizar-actividad-responsables.dto";

@Controller('actividades/:actividadId/responsables')
    export class actividadResponsableController {
        constructor(
            private readonly registrarResponsableUC: registrarActividadResponsableUseCase,
            private readonly listarRespomsableUC: listarActividadResponsablesUseCase,
            private readonly actualizarResponsableUC: actualizarActividadResponsablesUseCase,
            private readonly eliminarResponsableUC: eliminarActividadResponsablesUseCase,
        ) {}

        @Post()
        registrar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: registrarActividadResponsableDto) {
            return this.registrarResponsableUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarRespomsableUC.ejecutar(actividadId);
        }

        @Patch(':id')
        actualizarHoras(@Param('id', ParseIntPipe) id: number, @Body() dto: actualizarActividadResponsableDto) {
            return this.actualizarResponsableUC.ejecutar(id, dto.horas);
        }

        @Delete(':id')
        eliminar(@Param('id', ParseIntPipe) id: number) {
            return this.eliminarResponsableUC.ejecutar(id);
        }
    }