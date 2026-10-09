import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { CrearTratamientoUseCase } from "../../application/use-cases/crear.tratamiento.use-case";
import { ListarTratamientosUseCase } from "../../application/use-cases/listar.tratamientos.use-case";
import { CambiarEstadoTratamientoUseCase } from "../../application/use-cases/cambiar-estado.tratamiento.use-case";
import { EliminarTratamientoUseCase } from "../../application/use-cases/eliminar.tratamiento.use-case";
import { CambiarEstadoTratamientoDto, CrearTratamientoDto } from "../../application/dtos/crear-tratamiento.dto";

@Controller('tratamientos')
export class TratamientoController {
    constructor(
        private readonly crearTratamientoUC: CrearTratamientoUseCase,
        private readonly listarTratamientosUC: ListarTratamientosUseCase,
        private readonly cambiarEstadoUC: CambiarEstadoTratamientoUseCase,
        private readonly eliminarTratamientoUC: EliminarTratamientoUseCase,
    ) {}

    @Post()
    async crear(@Body() dto: CrearTratamientoDto) {
        return await this.crearTratamientoUC.ejecutar(dto);
    }

    /** Todos los tratamientos, o los de una incidencia con ?incidenciaId= */
    @Get()
    async listar(@Query('incidenciaId') incidenciaId?: string) {
        return await this.listarTratamientosUC.ejecutar(incidenciaId ? Number(incidenciaId) : undefined);
    }

    @Patch(':id/estado')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoTratamientoDto,
    ) {
        return await this.cambiarEstadoUC.ejecutar(id, dto.estado);
    }

    @Delete(':id')
    async eliminar(@Param('id', ParseIntPipe) id: number) {
        return await this.eliminarTratamientoUC.ejecutar(id);
    }
}