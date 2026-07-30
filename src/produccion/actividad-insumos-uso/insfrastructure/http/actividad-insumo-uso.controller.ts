import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { listarActividadInsumoUsoUseCase } from "../../application/use-cases/listar-actividad-insumo-uso.use-case";
import { registrarInsumoUseCase } from "../../application/use-cases/registrar-insumo-uso.use-case";
import { registrarInsumoUsoDto } from "../../application/dto/registrar-insumo-uso.dto";

@Controller('actividad/:actividadId/insumoUso')
    export class actividadInsumoUsoController {
        constructor(
            private readonly registarInsumoUsoUC: registrarInsumoUseCase,
            private readonly listarInsumoUsoUC: listarActividadInsumoUsoUseCase,
        ) {}

        @Post()
        regitrar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: registrarInsumoUsoDto) {
            return this.registarInsumoUsoUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarInsumoUsoUC.ejecutar(actividadId);
        }
    }