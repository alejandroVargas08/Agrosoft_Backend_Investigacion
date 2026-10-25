import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GestionarProgramasFormacionUseCase } from '../../../application/use-cases/programa-formacion/gestionar-programas-formacion.use-case';
import { CrearProgramaFormacionDto } from '../../../application/dto/programa-formacion/crear-programa-formacion.dto';
import { ActualizarProgramaFormacionDto } from '../../../application/dto/programa-formacion/actualizar-programa-formacion.dto';
import { Autenticado } from '../decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_USUARIOS } from '../permisos-iam';

@Controller('programas-formacion')
export class ProgramasFormacionController {
  constructor(private readonly programas: GestionarProgramasFormacionUseCase) {}

  @Get()
  listarActivos() {
    return this.programas.listarActivos();
  }

  @Get('todos')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  listarTodos() {
    return this.programas.listarTodos();
  }

  @Get('resumen')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  resumen() {
    return this.programas.resumen();
  }

  @Post()
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  crear(@Body() dto: CrearProgramaFormacionDto) {
    return this.programas.crear(dto);
  }

  @Patch(':id')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarProgramaFormacionDto) {
    return this.programas.actualizar(id, dto);
  }
}
