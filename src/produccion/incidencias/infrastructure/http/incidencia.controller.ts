import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { RequierePermisos } from "../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { CrearIncidenciaUseCase } from "../../application/use-cases/crear.incidencia.use-case";
import { ListarIncidenciasUseCase } from "../../application/use-cases/listar.incidencias.use-case";
import { CambiarEstadoIncidenciaUseCase } from "../../application/use-cases/cambiar-estado.incidencia.use-case";
import { EliminarIncidenciaUseCase } from "../../application/use-cases/eliminar.incidencia.use-case";
import { CambiarEstadoIncidenciaDto, CrearIncidenciaDto } from "../../application/dtos/crear-incidencia.dto";

@Controller('incidencias')
@Autenticado()
export class IncidenciaController {
    constructor(
        private readonly crearIncidenciaUC: CrearIncidenciaUseCase,
        private readonly listarIncidenciasUC: ListarIncidenciasUseCase,
        private readonly cambiarEstadoUC: CambiarEstadoIncidenciaUseCase,
        private readonly eliminarIncidenciaUC: EliminarIncidenciaUseCase,
    ) {}

    @Post()
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    crear(@Body() dto: CrearIncidenciaDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearIncidenciaUC.ejecutar(dto, usuario);
    }

    @Get()
    @RequierePermisos(PERMISOS_PRODUCCION.VER_INCIDENCIAS)
    listar(@UsuarioActual() usuario: UsuarioAutenticado, @Query('cultivoId') cultivoId?: string) {
        return this.listarIncidenciasUC.ejecutar(usuario, cultivoId ? Number(cultivoId) : undefined);
    }

    @Patch(':id/estado')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoIncidenciaDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.cambiarEstadoUC.ejecutar(id, dto.estado, usuario);
    }

    @Delete(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_INCIDENCIAS)
    eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.eliminarIncidenciaUC.ejecutar(id, usuario);
    }
}
