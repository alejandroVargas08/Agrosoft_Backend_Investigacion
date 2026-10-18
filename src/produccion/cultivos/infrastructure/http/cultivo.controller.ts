import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { RequierePermisos } from "../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { CrearCultivoUseCase } from "../../application/use-cases/crear.cultivo.use-case";
import { listarCultivoUseCase } from "../../application/use-cases/listar.cultivos.use-case";
import { ObtenerCultivoUseCase } from "../../application/use-cases/obtener.cultivo.use-case";
import { ActualizarCultivoUseCase } from "../../application/use-cases/actualizar.cultivo.use.case";
import { finalizarCultivoUseCase } from "../../application/use-cases/finalizar.cultivo.use-case";
import { eliminarCultivoUseCase } from "../../application/use-cases/eliminar.cultivo.use-case";
import { CrearCultivoDto } from "../../application/dtos/crear-cultivo.dto";
import type { ActualizarCultivoDto } from "../../application/dtos/actualizar-cultivo.do";

@Controller('cultivos')
@Autenticado()
export class CultivoController {
    constructor(
        private readonly crearCultivoUC: CrearCultivoUseCase,
        private readonly listarCultivoUC: listarCultivoUseCase,
        private readonly obtenerCultivoUC: ObtenerCultivoUseCase,
        private readonly actualizarCultivoUC: ActualizarCultivoUseCase,
        private readonly finalizarCultivoUC: finalizarCultivoUseCase,
        private readonly eliminarCultivoUC: eliminarCultivoUseCase,
    ) {}

    @Post()
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_CULTIVOS)
    crear(@Body() dto: CrearCultivoDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearCultivoUC.ejecutar(dto, usuario);
    }

    @Get()
    @RequierePermisos(PERMISOS_PRODUCCION.VER_CULTIVOS)
    listar(@Query('loteId', ParseIntPipe) loteId: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.listarCultivoUC.ejecutar(loteId, usuario);
    }

    @Get(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.VER_CULTIVOS)
    obtenerPorId(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.obtenerCultivoUC.ejecutar(id, usuario);
    }

    @Patch(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_CULTIVOS)
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() datosActualizados: ActualizarCultivoDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.actualizarCultivoUC.ejecutar(id, datosActualizados, usuario);
    }

    @Patch(':id/finalizar')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_CULTIVOS)
    finalizar(
        @Param('id', ParseIntPipe) id: number,
        @Body('fechaFinalizacion') fechaFinalizacion: string,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.finalizarCultivoUC.ejecutar(id, new Date(fechaFinalizacion), usuario);
    }

    @Delete(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_CULTIVOS)
    eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.eliminarCultivoUC.ejecutar(id, usuario);
    }
}
