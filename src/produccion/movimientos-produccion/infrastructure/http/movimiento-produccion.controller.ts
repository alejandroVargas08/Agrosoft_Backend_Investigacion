import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { listarMovimientoProduccionUseCase } from "../../application/use-cases/listar-movimiento-produccion.use-case";
import { registrarMovimientoProduccionUseCase } from "../../application/use-cases/registrar-movimiento-produccion.use-case";
import { registrarMovimientoProduccionDto } from "../../application/dto/registrar-movimiento-produccion.dto";

@Controller('loteProduccion/:loteProduccionId/movimientos')
    export class movimientoProduccionController {
        constructor(
            private readonly registrarMovimientoUC: registrarMovimientoProduccionUseCase,
            private readonly listarMovimientoUC: listarMovimientoProduccionUseCase,
        ) {}

        @Post()
        registrar(@Param('loteProduccionId', ParseIntPipe) loteProduccionId: number, @Body() dto: registrarMovimientoProduccionDto) {
            return this.registrarMovimientoUC.ejecutar(loteProduccionId, dto);
        }

        @Get()
        listar(@Param('loteProduccionId', ParseIntPipe) loteProduccionId: number, ) {
            return this.listarMovimientoUC.ejecutar(loteProduccionId);
        }
    }