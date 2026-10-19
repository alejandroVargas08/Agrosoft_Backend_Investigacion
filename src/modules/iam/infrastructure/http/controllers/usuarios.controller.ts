import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { CrearUsuarioUseCase } from '../../../application/use-cases/usuarios/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/usuarios/actualizar-usuario.use-case';
import { LoginUsuarioUseCase } from '../../../application/use-cases/usuarios/login-usuario.use-case';
import { EliminarUsuarioUseCase } from '../../../application/use-cases/usuarios/eliminar-usuario.use-case';
import { ObtenerUsuarioUseCase } from '../../../application/use-cases/usuarios/obtener-usuario.use-case';
import { AdministrarUsuarioUseCase } from '../../../application/use-cases/usuarios/administrar-usuario.use-case';
import { CrearUsuarioDto } from '../../../application/dto/usuarios/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../../../application/dto/usuarios/actualizar-usuario.dto';
import { LoginUsuarioDto } from '../../../application/dto/usuarios/login-usuario.dto';
import { CambiarProgramaUsuarioDto, CambiarRolUsuarioDto } from '../../../application/dto/usuarios/administrar-usuario.dto';
import { aUsuarioPublico } from '../../../application/dto/usuarios/usuario-respuesta.mapper';
import type { UsuarioAutenticado } from '../../../domain/value-objects/alcance-datos.vo';
import { Autenticado } from '../decorators/autenticado.decorator';
import { UsuarioActual } from '../decorators/usuario-actual.decorator';
import { PERMISO_GESTIONAR_USUARIOS, PERMISO_ASIGNAR_ACTIVIDADES } from '../permisos-iam';

function validarPropioOAdministrador(usuario: UsuarioAutenticado, id: number): void {
  if (usuario.id !== id && !usuario.permisos.includes(PERMISO_GESTIONAR_USUARIOS)) {
    throw new ForbiddenException('Solo puedes consultar o editar tu propio perfil');
  }
}

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
    private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase,
    private readonly obtenerUsuarioUseCase: ObtenerUsuarioUseCase,
    private readonly administrarUsuarioUseCase: AdministrarUsuarioUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.crearUsuarioUseCase.ejecutar(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUsuarioDto) {
    return this.loginUsuarioUseCase.ejecutar(dto);
  }

  @Get()
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  listar() {
    return this.administrarUsuarioUseCase.listar();
  }

  @Get(':id')
  @Autenticado()
  obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    validarPropioOAdministrador(usuario, id);
    return this.obtenerUsuarioUseCase.ejecutar(id);
  }
  
  @Get('aprendices')
  @Autenticado(PERMISO_ASIGNAR_ACTIVIDADES)
  listarAprendices(@UsuarioActual() usuario: UsuarioAutenticado, @Query('programaFormacionId') programaFormacionId?: string) {
    const programa = programaFormacionId ? Number(programaFormacionId) : undefined;
    return this.administrarUsuarioUseCase.listarAprendices(usuario, Number.isInteger(programa) ? programa : undefined);
  }

  @Patch(':id')
  @Autenticado()
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    validarPropioOAdministrador(usuario, id);
    if (dto.estado && !usuario.permisos.includes(PERMISO_GESTIONAR_USUARIOS)) {
      throw new ForbiddenException('Solo un administrador puede cambiar el estado de un usuario');
    }
    return aUsuarioPublico(await this.actualizarUsuarioUseCase.ejecutar(id, dto));
  }

  @Patch(':id/rol')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  cambiarRol(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarRolUsuarioDto) {
    return this.administrarUsuarioUseCase.cambiarRol(id, dto.rolId);
  }

  @Patch(':id/programa')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  cambiarPrograma(@Param('id', ParseIntPipe) id: number, @Body() dto: CambiarProgramaUsuarioDto) {
    return this.administrarUsuarioUseCase.cambiarPrograma(id, dto.programaFormacionId ?? null);
  }

  @Delete(':id')
  @Autenticado(PERMISO_GESTIONAR_USUARIOS)
  eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    if (usuario.id === id) {
      throw new ForbiddenException('No puedes eliminar tu propio usuario');
    }
    return this.eliminarUsuarioUseCase.ejecutar(id);
  }
}
