import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { CrearUsuarioUseCase } from '../../../application/use-cases/usuarios/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from '../../../application/use-cases/usuarios/actualizar-usuario.use-case';
import { LoginUsuarioUseCase } from '../../../application/use-cases/usuarios/login-usuario.use-case';
import { EliminarUsuarioUseCase } from '../../../application/use-cases/usuarios/eliminar-usuario.use-case';
import { CrearUsuarioDto } from '../../../application/dto/usuarios/crear-usuario.dto';
import { ActualizarUsuarioDto } from '../../../application/dto/usuarios/actualizar-usuario.dto';
import { LoginUsuarioDto } from '../../../application/dto/usuarios/login-usuario.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly crearUsuarioUseCase: CrearUsuarioUseCase,
    private readonly actualizarUsuarioUseCase: ActualizarUsuarioUseCase,
    private readonly loginUsuarioUseCase: LoginUsuarioUseCase,
    private readonly eliminarUsuarioUseCase: EliminarUsuarioUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    return await this.crearUsuarioUseCase.ejecutar(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUsuarioDto) {
    return await this.loginUsuarioUseCase.ejecutar(dto);
  }

  @Patch(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return await this.actualizarUsuarioUseCase.ejecutar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return await this.eliminarUsuarioUseCase.ejecutar(id);
  }
}