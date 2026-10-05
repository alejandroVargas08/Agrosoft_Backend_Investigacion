import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { registrarActividadInsumoUseCase } from "../../aplicattion/use-case/registrar-actividad-insumo.use-case";
import { listarActividadInsumosUseCase } from "../../aplicattion/use-case/listar-actividad-insumos.use-case";
import { registrarActividadInsumoDto } from "../../aplicattion/dto/registrar-actividad-insumo.dto";
import { eliminarActividadInsumoUseCase } from "../../aplicattion/use-case/eliminar-actividad-insumo.use-case";

@Controller('actividades/:actividadId/insumos')
    export class actividadInsumoController {
        constructor(
            private readonly registrarInsumoUC: registrarActividadInsumoUseCase,
            private readonly listarInsumoUC: listarActividadInsumosUseCase,
            private readonly eliminarInsumoUC: eliminarActividadInsumoUseCase,
        ) {}

        @Post()
        registrar(@Param('actividadId', ParseIntPipe) actividadId: number, 
        @Body() dto: registrarActividadInsumoDto) {
            return this.registrarInsumoUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarInsumoUC.ejecutar(actividadId);
        }

        @Delete(':id')
        eliminar(@Param('id', ParseIntPipe) id: number) {
            return this.eliminarInsumoUC.ejecutar(id);
        }
    }