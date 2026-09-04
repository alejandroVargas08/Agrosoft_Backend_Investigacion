import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearAlmacenUseCase } from '../../application/use-cases/almacen/crear-almacen.use-case';
import { ListarAlmacenesUseCase } from '../../application/use-cases/almacen/listar-almacenes.use-case';
import { CrearAlmacenDto } from './dto/catalogo-request.dto';

@Controller('inventario/almacenes')
export class AlmacenController {
    constructor(
        private readonly crearAlmacen: CrearAlmacenUseCase,
        private readonly listarAlmacenes: ListarAlmacenesUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearAlmacenDto) {
        return this.crearAlmacen.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarAlmacenes.ejecutar();
    }
}