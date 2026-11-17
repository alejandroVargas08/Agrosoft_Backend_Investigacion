import { Controller, Get } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../domain/value-objects/alcance-datos.vo';
import { GestionarProgramasFormacionUseCase } from '../../../application/use-cases/programa-formacion/gestionar-programas-formacion.use-case';
import { Autenticado } from '../decorators/autenticado.decorator';
import { UsuarioActual } from '../decorators/usuario-actual.decorator';

@Controller('mi-acceso')
@Autenticado()
export class MiAccesoController {
  constructor(private readonly programas: GestionarProgramasFormacionUseCase) {}

  @Get()
  obtener(@UsuarioActual() usuario: UsuarioAutenticado) {
    return usuario;
  }

  @Get('programas')
  programasAsignables(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.programas.listarAsignables(usuario);
  }
}
