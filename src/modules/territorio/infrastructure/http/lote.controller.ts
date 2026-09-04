import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearLoteUseCase } from '../../application/use-cases/crear-lote.use-case';
import { ListarLotesUseCase } from '../../application/use-cases/listar-lotes.use-case';
import { ObtenerLotePorIdUseCase } from '../../application/use-cases/obtener-lote-por-id.use-case';
import { CambiarEstadoLoteUseCase } from '../../application/use-cases/cambiar-estado-lote.use-case';
import { EliminarLoteUseCase } from '../../application/use-cases/eliminar-lote.use-case';
import { CrearLoteDto, CambiarEstadoLoteDto } from './dto/lote-request.dto';

@Controller('territorio/lotes')
export class LoteController {
    constructor(
        private readonly crearLote: CrearLoteUseCase,
        private readonly listarLotes: ListarLotesUseCase,
        private readonly obtenerLotePorId: ObtenerLotePorIdUseCase,
        private readonly cambiarEstadoLote: CambiarEstadoLoteUseCase,
        private readonly eliminarLote: EliminarLoteUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearLoteDto) {
        return this.crearLote.ejecutar(dto);
    }

    @Get()
    listar() {
        return this.listarLotes.ejecutar();
    }

    @Get(':id')
    obtenerPorId(@Param('id', ParseIntPipe) id: number) {
        return this.obtenerLotePorId.ejecutar(id);
    }

    @Patch(':id/estado')
    cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoLoteDto) {
        return this.cambiarEstadoLote.ejecutar({ loteId: id, nuevoEstado: dto.nuevoEstado });
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.eliminarLote.ejecutar(id);
}
}