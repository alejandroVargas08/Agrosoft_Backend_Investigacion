import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { listarHistorialCultivoUseCase } from "../../application/use-cases/listar-historial-cultivo.use-case";
import { historialCultivo } from "../../domain/entities/historial-cultivo.entity";

@Controller('cultivos')
    export class historialCultivoController {
        constructor(
            private readonly listarhistorialCultivoUC: listarHistorialCultivoUseCase,
        ) {}

        @Get(':id/historial')
        listarPorCultivo(@Param('id', ParseIntPipe) id: number,) {
            return this.listarhistorialCultivoUC.execute(id);
        }
    }