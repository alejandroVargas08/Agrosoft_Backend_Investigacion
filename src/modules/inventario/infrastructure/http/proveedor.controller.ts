import { Body, Controller, Get, Post } from '@nestjs/common';
import { CrearProveedorUseCase } from '../../application/use-cases/proveedor/crear-proveedor.use-case';
import { ListarProveedoresUseCase } from '../../application/use-cases/proveedor/listar-proveedores.use-case';
import { CrearProveedorDto } from './dto/catalogo-request.dto';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_INVENTARIO, PERMISO_VER_INVENTARIO } from './permisos-inventario';

@Controller('inventario/proveedores')
export class ProveedorController {
    constructor(
        private readonly crearProveedor: CrearProveedorUseCase,
        private readonly listarProveedores: ListarProveedoresUseCase,
    ) {}

    @Autenticado(PERMISO_GESTIONAR_INVENTARIO)
    @Post()
    crear(@Body() dto: CrearProveedorDto) {
        return this.crearProveedor.ejecutar(dto);
    }

    @Autenticado(PERMISO_VER_INVENTARIO)
    @Get()
    listar() {
        return this.listarProveedores.ejecutar();
    }
}