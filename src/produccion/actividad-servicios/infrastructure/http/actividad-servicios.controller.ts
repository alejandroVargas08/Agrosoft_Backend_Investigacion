import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { registrarActividadServicioUseCase } from "../../aplicattion/use-cases/registrar-actividad-servicios.use-case";
import { actualizarActividadServicioUseCase } from "../../aplicattion/use-cases/actualizar-actividad-servicios.use-case";
import { eliminarActividadServicioUseCase } from "../../aplicattion/use-cases/eliminar-actividad-servicios.use-case";
import { listarActividadServicioUseCase } from "../../aplicattion/use-cases/listar-actividad-servicios.use-case";
import { registraractividadServicioDto } from "../../aplicattion/dto/registrar-actividad-servicio.dto";
import { actualizarActividadServicioDto } from "../../aplicattion/dto/actualizar-actividad-servicios.dto";

@Controller('actividades/:actividadId/servicios')
    export class actividadServicioController {
        constructor(
            private readonly registrarServicioUC: registrarActividadServicioUseCase,
            private readonly listarServiciosUC: listarActividadServicioUseCase,
            private readonly actualizarServicioUC: actualizarActividadServicioUseCase,
            private readonly eliminarServicioUC: eliminarActividadServicioUseCase, 
        ) {}

    @Post()
    registrar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: registraractividadServicioDto)  {
        return this.registrarServicioUC.ejecutar(actividadId, dto);
    }

    @Get()
    listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
        return this.listarServiciosUC.ejecutar(actividadId);
    }

    @Patch(':id')
    actualizarHoras(@Param('id', ParseIntPipe) id: number, @Body() dto: actualizarActividadServicioDto) {
        return this.actualizarServicioUC.ejecutar(id, dto.horas);
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.eliminarServicioUC.ejecutar(id);
    }
}