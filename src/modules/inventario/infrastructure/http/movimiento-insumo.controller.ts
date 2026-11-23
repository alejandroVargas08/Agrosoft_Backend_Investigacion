import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrarMovimientoInsumoUseCase } from '../../application/use-cases/movimiento/registrar-movimiento-insumo.use-case';
import { ListarMovimientosUseCase } from '../../application/use-cases/movimiento/listar-movimientos.use-case';
import { RegistrarMovimientoDto } from './dto/movimiento-request.dto';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_INVENTARIO, PERMISO_VER_INVENTARIO } from './permisos-inventario';

@Controller('inventario/movimientos')
export class MovimientoInsumoController {
    constructor(
        private readonly registrarMovimiento: RegistrarMovimientoInsumoUseCase,
        private readonly listarMovimientos: ListarMovimientosUseCase,
    ) {}

    @Autenticado(PERMISO_GESTIONAR_INVENTARIO)
    @Post()
    registrar(@Body() dto: RegistrarMovimientoDto) {
        return this.registrarMovimiento.ejecutar(dto);
    }

    @Autenticado(PERMISO_VER_INVENTARIO)
    @Get()
    listar() {
        return this.listarMovimientos.ejecutar();
    }
}