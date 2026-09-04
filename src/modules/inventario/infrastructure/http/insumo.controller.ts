import { Body, Controller, Get } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { CrearInsumoUseCase } from '../../application/use-cases/insumo/crear-insumo.use-case';
import { ListarInsumosUseCase } from '../../application/use-cases/insumo/listar-insumos.use-case';
import { ListarInsumosBajoStockMinimoUseCase } from '../../application/use-cases/insumo/listar-insumos-bajo-stock-minimo.use-case';
import { CrearInsumoDto } from './dto/insumo-request.dto';

@Controller('inventario/insumos')
export class InsumoController {
    constructor(
        private readonly crearInsumo: CrearInsumoUseCase,
        private readonly listarInsumos: ListarInsumosUseCase,
        private readonly listarBajoStockMinimo: ListarInsumosBajoStockMinimoUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearInsumoDto) {
        return this.crearInsumo.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarInsumos.ejecutar();
    }

    @Get('bajo-stock-minimo')
    listarBajoStock() {
        return this.listarBajoStockMinimo.ejecutar();
    }
}