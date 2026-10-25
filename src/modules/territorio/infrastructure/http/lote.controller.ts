import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { CrearLoteUseCase } from '../../application/use-cases/crear-lote.use-case';
import { ListarLotesUseCase } from '../../application/use-cases/listar-lotes.use-case';
import { ObtenerLotePorIdUseCase } from '../../application/use-cases/obtener-lote-por-id.use-case';
import { CambiarEstadoLoteUseCase } from '../../application/use-cases/cambiar-estado-lote.use-case';
import { EliminarLoteUseCase } from '../../application/use-cases/eliminar-lote.use-case';
import { AsignarProgramaLoteUseCase } from '../../application/use-cases/asignar-programa-lote.use-case';
import { CrearLoteDto, CambiarEstadoLoteDto, AsignarProgramaLoteDto } from './dto/lote-request.dto';

@Controller('territorio/lotes')
@Autenticado()
export class LoteController {
    constructor(
        private readonly crearLote: CrearLoteUseCase,
        private readonly listarLotes: ListarLotesUseCase,
        private readonly obtenerLotePorId: ObtenerLotePorIdUseCase,
        private readonly cambiarEstadoLote: CambiarEstadoLoteUseCase,
        private readonly eliminarLote: EliminarLoteUseCase,
        private readonly asignarProgramaLote: AsignarProgramaLoteUseCase,
    ) {}

    @Post()
    @RequierePermisos('lotes.gestionar')
    crear(@Body() dto: CrearLoteDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearLote.ejecutar(dto, usuario);
    }

    @Get()
    @RequierePermisos('lotes.ver')
    listar(@UsuarioActual() usuario: UsuarioAutenticado) {
        return this.listarLotes.ejecutar(usuario);
    }

    @Get(':id')
    @RequierePermisos('lotes.ver')
    obtenerPorId(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.obtenerLotePorId.ejecutar(id, usuario);
    }

    @Patch(':id/estado')
    @RequierePermisos('lotes.gestionar')
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoLoteDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.cambiarEstadoLote.ejecutar({ loteId: id, nuevoEstado: dto.nuevoEstado }, usuario);
    }

    @Patch(':id/programa')
    @RequierePermisos('lotes.gestionar')
    asignarPrograma(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AsignarProgramaLoteDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.asignarProgramaLote.ejecutar(id, dto.programaFormacionId ?? null, usuario);
    }

    @Delete(':id')
    @RequierePermisos('lotes.gestionar')
    eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.eliminarLote.ejecutar(id, usuario);
    }
}
