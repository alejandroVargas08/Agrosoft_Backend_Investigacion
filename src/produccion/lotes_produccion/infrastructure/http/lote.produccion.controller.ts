import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ActualizarLoteProduccionUseCase } from "../../application/use-cases/actualizar.lotes.produccion.use-case";
import { CrearLoteProduccionUseCase } from "../../application/use-cases/crear-lotes-produccion.uses-case";
import { listarLotesProduccionUseCase } from "../../application/use-cases/listar.lotes.produccion.use-case";
import type { CrearLoteProduccionDto } from "../../application/dtos/crear-lote.produccion.dto";
import type { ActualizarLoteProduccionDto } from "../../application/dtos/actualizar-lote.produccion.dto";
import { descontarStockUseCase } from "../../application/use-cases/descontar-lotes-produccion-use-case";

@Controller('loteProduccion')
export class loteProduccionController {
    constructor(
        private readonly crearLoteUC: CrearLoteProduccionUseCase,
        private readonly actualizarLoteUC: ActualizarLoteProduccionUseCase,
        private readonly listarLoteUC: listarLotesProduccionUseCase,
        private readonly descontarStockUC: descontarStockUseCase,
    ) {}

    @Post()
    async crear(@Body() dto: CrearLoteProduccionDto) {
        return await this.crearLoteUC.ejecutar(dto);
    }

    @Get()
    async listar(@Query('cultivoId') cultivoId?: string) {
        return await this.listarLoteUC.ejecutar(cultivoId ? Number(cultivoId) : undefined);
    }

    @Patch(':id')
    async actualizar(@Param('id') id: string, @Body() dot: ActualizarLoteProduccionDto) {
        return await this.actualizarLoteUC.ejecutar(Number(id), dot);
    }

    @Patch(':id/stock')
    async descontarStock(@Param('id') id: string, @Body('cantidadKg') cantidadKg: number) {
        return await this.descontarStockUC.ejecutar(Number(id), cantidadKg);
    }
} 