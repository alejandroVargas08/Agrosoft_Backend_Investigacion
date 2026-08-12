import { Body, Controller, Post } from '@nestjs/common';
import { RegistrarMovimientoInsumoUseCase } from '../../application/use-cases/movimiento/registrar-movimiento-insumo.use-case';
import { RegistrarMovimientoDto } from './dto/movimiento-request.dto';

@Controller('inventario/movimientos')
export class MovimientoInsumoController {
    constructor(
        private readonly registrarMovimiento: RegistrarMovimientoInsumoUseCase,
    ) {}

    @Post()
    registrar(@Body() dto: RegistrarMovimientoDto) {
        return this.registrarMovimiento.ejecutar(dto);
    }
}