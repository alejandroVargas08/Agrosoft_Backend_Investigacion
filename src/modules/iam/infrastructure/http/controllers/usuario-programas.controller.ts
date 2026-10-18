import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { GestionarProgramasACargoUseCase } from '../../../application/use-cases/usuario-programas/gestionar-programas-a-cargo.use-case';
import { AsignarProgramaDto } from '../../../application/use-cases/usuario-programas/asignar-programa.dto';
import { Autenticado } from '../decorators/autenticado.decorator';
import { PERMISO_GESTIONAR_USUARIOS } from '../permisos-iam';

@Controller('usuarios/:usuarioId/programas')
@Autenticado(PERMISO_GESTIONAR_USUARIOS)
export class UsuarioProgramasController {
  constructor(private readonly gestionarProgramas: GestionarProgramasACargoUseCase) {}

  @Get()
  listar(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.gestionarProgramas.listar(usuarioId);
  }

  @Post()
  asignar(@Param('usuarioId', ParseIntPipe) usuarioId: number, @Body() dto: AsignarProgramaDto) {
    return this.gestionarProgramas.asignar(usuarioId, dto.programaFormacionId);
  }

  @Delete(':programaFormacionId')
  quitar(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('programaFormacionId', ParseIntPipe) programaFormacionId: number,
  ) {
    return this.gestionarProgramas.quitar(usuarioId, programaFormacionId);
  }
}
