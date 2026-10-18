import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { RequierePermisos } from "../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { CrearTratamientoUseCase } from "../../application/use-cases/crear.tratamiento.use-case";
import { ListarTratamientosUseCase } from "../../application/use-cases/listar.tratamientos.use-case";
import { CambiarEstadoTratamientoUseCase } from "../../application/use-cases/cambiar-estado.tratamiento.use-case";
import { EliminarTratamientoUseCase } from "../../application/use-cases/eliminar.tratamiento.use-case";
import { CambiarEstadoTratamientoDto, CrearTratamientoDto } from "../../application/dtos/crear-tratamiento.dto";

@Controller('tratamientos')
@Autenticado()
export class TratamientoController {
    constructor(
        private readonly crearTratamientoUC: CrearTratamientoUseCase,
        private readonly listarTratamientosUC: ListarTratamientosUseCase,
        private readonly cambiarEstadoUC: CambiarEstadoTratamientoUseCase,
        private readonly eliminarTratamientoUC: EliminarTratamientoUseCase,
    ) {}

    @Post()
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    crear(@Body() dto: CrearTratamientoDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearTratamientoUC.ejecutar(dto, usuario);
    }

    @Get()
    @RequierePermisos(PERMISOS_PRODUCCION.VER_INCIDENCIAS)
    listar(@UsuarioActual() usuario: UsuarioAutenticado, @Query('incidenciaId') incidenciaId?: string) {
        return this.listarTratamientosUC.ejecutar(usuario, incidenciaId ? Number(incidenciaId) : undefined);
    }

    @Patch(':id/estado')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoTratamientoDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.cambiarEstadoUC.ejecutar(id, dto.estado, usuario);
    }

    @Delete(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.eliminarTratamientoUC.ejecutar(id, usuario);
    }
}
