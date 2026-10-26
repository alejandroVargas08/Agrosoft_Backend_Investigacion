import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { RequierePermisos } from "../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { AprobarTareaDto, AsignarActividadDto, DevolverTareaDto, EntregarTareaDto } from "../../aplicattion/dto/asignaciones.dto";
import { GestionarAsignacionesUseCase } from "../../aplicattion/use-cases/asignaciones/gestionar-asignaciones.use-case";
import { MisTareasUseCase } from "../../aplicattion/use-cases/asignaciones/mis-tareas.use-case";
import { RevisarAsignacionesUseCase } from "../../aplicattion/use-cases/asignaciones/revisar-asignaciones.use-case";
import { ResumenAprendicesUseCase } from "../../aplicattion/use-cases/asignaciones/resumen-aprendices.use-case";

@Controller('actividades/:actividadId/asignaciones')
@Autenticado()
export class ActividadAsignacionesController {
    constructor(private readonly gestionar: GestionarAsignacionesUseCase) {}

    @Post()
    @RequierePermisos(PERMISOS_PRODUCCION.ASIGNAR_ACTIVIDADES)
    asignar(
        @Param('actividadId', ParseIntPipe) actividadId: number,
        @Body() dto: AsignarActividadDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.gestionar.asignar(actividadId, dto, usuario.id, usuario);
    }

    @Get()
    @RequierePermisos(PERMISOS_PRODUCCION.VER_ACTIVIDADES)
    listar(@Param('actividadId', ParseIntPipe) actividadId: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.gestionar.listarPorActividad(actividadId, usuario);
    }

    @Delete(':id')
    @RequierePermisos(PERMISOS_PRODUCCION.ASIGNAR_ACTIVIDADES)
    async quitar(
        @Param('actividadId', ParseIntPipe) actividadId: number,
        @Param('id', ParseIntPipe) id: number,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        await this.gestionar.quitar(actividadId, id, usuario);
        return { eliminada: true };
    }
}

@Controller('mis-tareas')
@Autenticado(PERMISOS_PRODUCCION.EJECUTAR_ACTIVIDADES)
export class MisTareasController {
    constructor(private readonly misTareas: MisTareasUseCase) {}

    @Get()
    listar(@UsuarioActual() usuario: UsuarioAutenticado, @Query('estado') estado?: string) {
        return this.misTareas.listar(usuario.id, estado);
    }

    @Get(':id')
    obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.misTareas.obtener(id, usuario.id);
    }

    @Patch(':id/iniciar')
    iniciar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.misTareas.iniciar(id, usuario.id);
    }

    @Patch(':id/entregar')
    entregar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: EntregarTareaDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.misTareas.entregar(id, usuario.id, dto);
    }
}

@Controller('asignaciones')
@Autenticado(PERMISOS_PRODUCCION.REVISAR_ACTIVIDADES)
export class RevisionAsignacionesController {
    constructor(private readonly revisar: RevisarAsignacionesUseCase) {}

    @Get('por-revisar')
    porRevisar(@UsuarioActual() usuario: UsuarioAutenticado) {
        return this.revisar.porRevisar(usuario);
    }

    @Patch(':id/aprobar')
    aprobar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AprobarTareaDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.revisar.aprobar(id, usuario.id, dto.comentario?.trim() || null, usuario);
    }

    @Patch(':id/devolver')
    devolver(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: DevolverTareaDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.revisar.devolver(id, usuario.id, dto.comentario, usuario);
    }
}

/**
 * El resumen de cada aprendiz para el instructor: cuántas tareas tiene, cuántas
 * le aprobaron, cuántas se le vencieron y cuántas horas lleva.
 */
@Controller('aprendices')
@Autenticado(PERMISOS_PRODUCCION.ASIGNAR_ACTIVIDADES)
export class ResumenAprendicesController {
    constructor(private readonly resumen: ResumenAprendicesUseCase) {}

    @Get('resumen')
    listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query('programaFormacionId') programaFormacionId?: string,
    ) {
        const programa = programaFormacionId ? Number(programaFormacionId) : undefined;
        return this.resumen.ejecutar(usuario, Number.isInteger(programa) ? programa : undefined);
    }

    // Va despues de 'resumen' pero no lo tapa: son dos segmentos, no uno
    @Get(':id/tareas')
    tareas(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.resumen.tareasDeAprendiz(id, usuario);
    }
}
