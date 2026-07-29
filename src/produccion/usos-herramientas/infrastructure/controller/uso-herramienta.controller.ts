import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { registrarUsoHerramientaUseCase } from "../../application/use-cases/registrar-uso-herramienta.use-case";
import { listarUsoHerramientasUseCase } from "../../application/use-cases/listar-uso-herramienta.use-case";
import { registrarUsoHerramientaDto } from "../../application/dto/registrar-uso-herramienta.dto";

@Controller('actividad/:actividadId/usoHerramienta')
    export class usoHerramientaController {
        constructor(
            private readonly registrarUsoHerramientaUC: registrarUsoHerramientaUseCase,
            private readonly listarUsoHerramientaUC: listarUsoHerramientasUseCase,
        ) {}

        @Post()
        registrar(@Param('actividadId', ParseIntPipe) actividadId: number,
        @Body() dto: registrarUsoHerramientaDto ) {
            return this.registrarUsoHerramientaUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarUsoHerramientaUC.ejecutar(actividadId);
        }
    }