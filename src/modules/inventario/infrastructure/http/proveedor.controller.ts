import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearProveedorUseCase } from '../../application/use-cases/proveedor/crear-proveedor.use-case';
import { ListarProveedoresUseCase } from '../../application/use-cases/proveedor/listar-proveedores.use-case';
import { CrearProveedorDto } from './dto/catalogo-request.dto';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';

@Controller('inventario/proveedores')
@Autenticado()
export class ProveedorController {
    constructor(
        private readonly crearProveedor: CrearProveedorUseCase,
        private readonly listarProveedores: ListarProveedoresUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearProveedorDto) {
        return this.crearProveedor.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarProveedores.ejecutar();
    }
}