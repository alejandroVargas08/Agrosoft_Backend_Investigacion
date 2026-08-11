import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearSubLoteUseCase } from '../../application/use-cases/crear-sublote.use-case';
import { ListarSubLotesPorLoteUseCase } from '../../application/use-cases/listar-sublotes-por-lote.use-case';
import { CambiarEstadoSubLoteUseCase } from '../../application/use-cases/cambiar-estado-sublote.use-case';
import { EliminarSubLoteUseCase } from '../../application/use-cases/eliminar-sublote.use-case';
import { CrearSubLoteDto, CambiarEstadoSubLoteDto } from './dto/sublote-request.dto';

@Controller('territorio/sublotes')
export class SubLoteController {
    constructor(
        private readonly crearSubLote: CrearSubLoteUseCase,
        private readonly listarSubLotesPorLote: ListarSubLotesPorLoteUseCase,
        private readonly cambiarEstadoSubLote: CambiarEstadoSubLoteUseCase,
        private readonly eliminarSubLote: EliminarSubLoteUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearSubLoteDto) {
        return this.crearSubLote.ejecutar(dto);
    }

    @Get('por-lote/:loteId')
    listarPorLote(@Param('loteId', ParseIntPipe) loteId: number) {
        return this.listarSubLotesPorLote.ejecutar(loteId);
    }

    @Patch(':id/estado')
    cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarEstadoSubLoteDto) {
        return this.cambiarEstadoSubLote.ejecutar({ subLoteId: id, nuevoEstado: dto.nuevoEstado });
    }

    @Delete(':id')
    eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.eliminarSubLote.ejecutar(id);
    }
}