import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearCategoriaUseCase } from '../../application/use-cases/categoria/crear-categoria.use-case';
import { ListarCategoriasUseCase } from '../../application/use-cases/categoria/listar-categorias.use-case';
import { CrearCategoriaDto } from './dto/catalogo-request.dto';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_INVENTARIO, PERMISO_VER_INVENTARIO } from './permisos-inventario';

@Controller('inventario/categorias')
export class CategoriaController {
    constructor(
        private readonly crearCategoria: CrearCategoriaUseCase,
        private readonly listarCategorias: ListarCategoriasUseCase,
    ) {}

    @Autenticado(PERMISO_GESTIONAR_INVENTARIO)
    @Post()
    crear(@Body() dto: CrearCategoriaDto) {
        return this.crearCategoria.ejecutar(dto);
    }

    @Autenticado(PERMISO_VER_INVENTARIO)
    @Get()
    listar() {
        return this.listarCategorias.ejecutar();
    }
}