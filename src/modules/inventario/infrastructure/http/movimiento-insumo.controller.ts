import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrarMovimientoInsumoUseCase } from '../../application/use-cases/movimiento/registrar-movimiento-insumo.use-case';
import { ListarMovimientosUseCase } from '../../application/use-cases/movimiento/listar-movimientos.use-case';
import { RegistrarMovimientoDto } from './dto/movimiento-request.dto';

@Controller('inventario/movimientos')
export class MovimientoInsumoController {
    constructor(
        private readonly registrarMovimiento: RegistrarMovimientoInsumoUseCase,
        private readonly listarMovimientos: ListarMovimientosUseCase,
    ) {}

    @Post()
    registrar(@Body() dto: RegistrarMovimientoDto) {
        return this.registrarMovimiento.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarMovimientos.ejecutar();
    }
}