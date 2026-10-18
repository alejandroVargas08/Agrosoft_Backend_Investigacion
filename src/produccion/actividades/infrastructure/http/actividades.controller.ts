import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { RequierePermisos } from "../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { crearActividadesUseCase } from "../../aplicattion/use-cases/crear-actividades.use-case";
import { listarActividadesUseCase } from "../../aplicattion/use-cases/listar-actividades.use-case";
import { actualizarActividadesUseCase } from "../../aplicattion/use-cases/actualizar-actividades.use-case";
import { cambiarActividadesUseCase } from "../../aplicattion/use-cases/cambiar-actividades.use-case";
import { eliminarActividadesUseCase } from "../../aplicattion/use-cases/eliminar-actividades.use-case";
import { crearActividadesDto } from "../../aplicattion/dto/crear-actividades.dto";
import { actualizarActividadesDto } from "../../aplicattion/dto/actualizar-actividades.dto";
import type { estadoActividad } from "../../domain/entities/actividades.entity";
import { AccesoActividadesService } from "../../aplicattion/services/acceso-actividades.service";

@Controller('actividades')
@Autenticado()
export class ActividadesController {
    constructor(
        private readonly crearActividadesUC: crearActividadesUseCase,
        private readonly listarActividadesUC: listarActividadesUseCase,
        private readonly actualizarActividadesUC: actualizarActividadesUseCase,
        private readonly cambiarActividadesUC: cambiarActividadesUseCase,
        private readonly eliminarActividadesUC: eliminarActividadesUseCase,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    @Post()
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES)
    crear(@Body() dto: crearActividadesDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.crearActividadesUC.execute(
            {
                nombre: dto.nombre,
                tipo: dto.tipo,
                subtipo: dto.subtipo ?? null,
                loteId: dto.loteId,
                subLoteId: dto.subLoteId ?? null,
                cultivoId: dto.cultivoId,
                fecha: new Date(dto.fecha),
                horasActividad: dto.horasActividad,
                precioHoraActividad: dto.precioHoraActividad,
                descripcion: dto.descripcion ?? '',
                cantidadPlantas: dto.cantidadPlantas ?? null,
                productoAgroId: dto.productoAgroId ?? null,
            },
            usuario.id,
            usuario,
        );
    }

    @Get('cultivo/:cultivoId')
    @RequierePermisos(PERMISOS_PRODUCCION.VER_ACTIVIDADES)
    listarPorCultivo(
        @Param('cultivoId', ParseIntPipe) cultivoId: number,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.listarActividadesUC.execute(cultivoId, usuario);
    }

    @Get(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.VER_ACTIVIDADES)
    obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.accesoActividades.obtenerActividadVisible(id, usuario);
    }

    @Patch(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES)
    actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: actualizarActividadesDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        const { fecha, ...datos } = dto;
        return this.actualizarActividadesUC.execute(
            id,
            { ...datos, ...(fecha ? { fecha: new Date(fecha) } : {}) },
            usuario,
        );
    }

    @Patch(':id/estado')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES)
    cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body('estado') estado: string,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.cambiarActividadesUC.execute(id, estado as estadoActividad, usuario);
    }

    @Delete(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.GESTIONAR_ACTIVIDADES)
    async eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        await this.eliminarActividadesUC.execute(id, usuario);
        return { message: `Actividad con ID ${id} eliminada correctamente` };
    }
}
