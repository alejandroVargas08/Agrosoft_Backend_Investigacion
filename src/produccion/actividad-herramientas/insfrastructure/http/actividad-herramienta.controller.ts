import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { asignarActividadHerramientaUseCase } from "../../application/use-cases/asignar-actividad-herramienta.use-case";
import { listarActividadHerramientaUseCase } from "../../application/use-cases/listar-actividad-herramienta.use-case";
import { quitarActividadHerramientaUseCase } from "../../application/use-cases/quitar-actividad-herramienra.use-case";
import { reEstimarActividadHerramientaUseCase } from "../../application/use-cases/reestimar-actividad-herramienta.use.case";
import { asignarActividadHerramientaDto } from "../../application/dto/asignar-actividad-herramienta.dto";
import { reEstimarHorasActividadHerramientaDto } from "../../application/dto/reestimar-actividad-herramienta.dto";

@Controller('actividad/:actividadId/herramientas')
    export class actividadHerramientaController {
        constructor(
            private readonly asignarHerramientaUC: asignarActividadHerramientaUseCase, 
            private readonly listarHerramientaUC: listarActividadHerramientaUseCase,
            private readonly reEstimarHerramientaUC: reEstimarActividadHerramientaUseCase,
            private readonly quitarHerramientaUC: quitarActividadHerramientaUseCase,
        ) {}

        @Post()
        asignar(@Param('actividadId', ParseIntPipe) actividadId: number,
        @Body() dto: asignarActividadHerramientaDto) {
            return this.asignarHerramientaUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarHerramientaUC.ejecutar(actividadId);
        }

        @Patch(':id/reestimar')
        reestimar(
            @Param('id', ParseIntPipe) id: number,
            @Body() dto: reEstimarHorasActividadHerramientaDto
        ) {
            return this.reEstimarHerramientaUC.ejecutar(id, dto.horasEstimadas);
        }

        @Delete(':id')
        quitar(@Param('id', ParseIntPipe) id: number) {
            return this.quitarHerramientaUC.ejecutar(id);
        }
    }