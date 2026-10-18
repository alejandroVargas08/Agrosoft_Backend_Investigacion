import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { CrearSubLoteUseCase } from '../../application/use-cases/crear-sublote.use-case';
import { ListarSubLotesPorLoteUseCase } from '../../application/use-cases/listar-sublotes-por-lote.use-case';
import { CambiarEstadoSubLoteUseCase } from '../../application/use-cases/cambiar-estado-sublote.use-case';
import { EliminarSubLoteUseCase } from '../../application/use-cases/eliminar-sublote.use-case';
import { CrearSubLoteDto, CambiarEstadoSubLoteDto } from './dto/sublote-request.dto';

@Controller('territorio/sublotes')
@Autenticado()
export class SubLoteController {
    constructor(
        private readonly crearSubLote: CrearSubLoteUseCase,
        private readonly listarSubLotesPorLote: ListarSubLotesPorLoteUseCase,
        private readonly cambiarEstadoSubLote: CambiarEstadoSubLoteUseCase,
        private readonly eliminarSubLote: EliminarSubLoteUseCase,
    ) {}

    @Post()
    @RequierePermisos('lotes.gestionar')
    crear(@Body() dto: CrearSubLoteDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearSubLote.ejecutar(dto, usuario);
    }

    @Get('por-lote/:loteId')
    @RequierePermisos('lotes.ver')
    listarPorLote(@Param('loteId', ParseIntPipe) loteId: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.listarSubLotesPorLote.ejecutar(loteId, usuario);
    }

    @Patch(':id/estado')
    @RequierePermisos('lotes.gestionar')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoSubLoteDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.cambiarEstadoSubLote.ejecutar({ subLoteId: id, nuevoEstado: dto.nuevoEstado }, usuario);
    }

    @Delete(':id')
    @RequierePermisos('lotes.gestionar')
    eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.eliminarSubLote.ejecutar(id, usuario);
    }
}
