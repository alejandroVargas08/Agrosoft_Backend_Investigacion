import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { CrearIncidenciaUseCase } from "../../application/use-cases/crear.incidencia.use-case";
import { ListarIncidenciasUseCase } from "../../application/use-cases/listar.incidencias.use-case";
import { CambiarEstadoIncidenciaUseCase } from "../../application/use-cases/cambiar-estado.incidencia.use-case";
import { EliminarIncidenciaUseCase } from "../../application/use-cases/eliminar.incidencia.use-case";
import { CambiarEstadoIncidenciaDto, CrearIncidenciaDto } from "../../application/dtos/crear-incidencia.dto";

@Controller('incidencias')
export class IncidenciaController {
    constructor(
        private readonly crearIncidenciaUC: CrearIncidenciaUseCase,
        private readonly listarIncidenciasUC: ListarIncidenciasUseCase,
        private readonly cambiarEstadoUC: CambiarEstadoIncidenciaUseCase,
        private readonly eliminarIncidenciaUC: EliminarIncidenciaUseCase,
    ) {}

    @Post()
    async crear(@Body() dto: CrearIncidenciaDto) {
        return await this.crearIncidenciaUC.ejecutar(dto);
    }

    /** Todas las incidencias, o las de un cultivo con ?cultivoId= */
    @Get()
    async listar(@Query('cultivoId') cultivoId?: string) {
        return await this.listarIncidenciasUC.ejecutar(cultivoId ? Number(cultivoId) : undefined);
    }

    @Patch(':id/estado')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoIncidenciaDto,
    ) {
        return await this.cambiarEstadoUC.ejecutar(id, dto.estado);
    }

    @Delete(':id')
    async eliminar(@Param('id', ParseIntPipe) id: number) {
        return await this.eliminarIncidenciaUC.ejecutar(id);
    }
}