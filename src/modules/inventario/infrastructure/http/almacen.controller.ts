import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearAlmacenUseCase } from '../../application/use-cases/almacen/crear-almacen.use-case';
import { ListarAlmacenesUseCase } from '../../application/use-cases/almacen/listar-almacenes.use-case';
import { CrearAlmacenDto } from './dto/catalogo-request.dto';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_INVENTARIO, PERMISO_VER_INVENTARIO } from './permisos-inventario';

@Controller('inventario/almacenes')
export class AlmacenController {
    constructor(
        private readonly crearAlmacen: CrearAlmacenUseCase,
        private readonly listarAlmacenes: ListarAlmacenesUseCase,
    ) {}

    @Autenticado(PERMISO_GESTIONAR_INVENTARIO)
    @Post()
    crear(@Body() dto: CrearAlmacenDto) {
        return this.crearAlmacen.ejecutar(dto);
    }

    @Autenticado(PERMISO_VER_INVENTARIO)
    @Get()
    listar() {
        return this.listarAlmacenes.ejecutar();
    }
}