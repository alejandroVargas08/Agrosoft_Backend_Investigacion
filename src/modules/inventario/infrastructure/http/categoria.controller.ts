import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearCategoriaUseCase } from '../../application/use-cases/categoria/crear-categoria.use-case';
import { ListarCategoriasUseCase } from '../../application/use-cases/categoria/listar-categorias.use-case';
import { CrearCategoriaDto } from './dto/catalogo-request.dto';

@Controller('inventario/categorias')
export class CategoriaController {
    constructor(
        private readonly crearCategoria: CrearCategoriaUseCase,
        private readonly listarCategorias: ListarCategoriasUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearCategoriaDto) {
        return this.crearCategoria.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarCategorias.ejecutar();
    }
}