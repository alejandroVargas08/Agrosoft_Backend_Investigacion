import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { PERMISOS_PRODUCCION } from '../../../permisos-produccion';
import { ReportarNovedadDto, ResponderNovedadDto } from '../../application/dtos/novedad.dto';
import { NovedadesUseCase } from '../../application/use-cases/novedades.use-case';

/** Lo que reporta y consulta el aprendiz sobre sus propias novedades. */
@Controller('mis-novedades')
@Autenticado(PERMISOS_PRODUCCION.EJECUTAR_ACTIVIDADES)
export class MisNovedadesController {
    constructor(private readonly novedades: NovedadesUseCase) {}

    @Post()
    reportar(@Body() dto: ReportarNovedadDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.novedades.reportar(dto, usuario);
    }

    @Get()
    listar(@UsuarioActual() usuario: UsuarioAutenticado, @Query('estado') estado?: string) {
        return this.novedades.mias(usuario, estado);
    }
}

/** La bandeja del instructor: las novedades de los aprendices que tiene a cargo. */
@Controller('novedades')
@Autenticado(PERMISOS_PRODUCCION.ASIGNAR_ACTIVIDADES)
export class NovedadesController {
    constructor(private readonly novedades: NovedadesUseCase) {}

    @Get()
    listar(@UsuarioActual() usuario: UsuarioAutenticado, @Query('estado') estado?: string) {
        return this.novedades.deMisAprendices(usuario, estado);
    }

    @Patch(':id/atender')
    atender(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ResponderNovedadDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.novedades.atender(id, dto, usuario);
    }

    @Patch(':id/descartar')
    descartar(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: ResponderNovedadDto,
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {
        return this.novedades.descartar(id, dto, usuario);
    }
}
