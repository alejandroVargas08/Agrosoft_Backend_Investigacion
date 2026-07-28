import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CrearRolUseCase } from '../../../application/use-cases/roles/crear-rol.use-case';
import { ListarRolesUseCase } from '../../../application/use-cases/roles/listar-roles.use-case';
import { ActualizarRolUseCase } from '../../../application/use-cases/roles/actualizar-rol.use-case';
import { EliminarRolUseCase } from '../../../application/use-cases/roles/eliminar-rol.use-case';
import { CrearRolDto } from '../../../application/dto/roles/crear-rol.dto';
import { ActualizarRolDto } from '../../../application/dto/roles/actualizar-rol.dto';
import { Rol } from '../../../domain/entities/rol.entity';

@Controller('roles')
export class RolController {
  constructor(
    private readonly crearRolUseCase: CrearRolUseCase,
    private readonly listarRolesUseCase: ListarRolesUseCase,
    private readonly actualizarRolUseCase: ActualizarRolUseCase,
    private readonly eliminarRolUseCase: EliminarRolUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CrearRolDto): Promise<Rol> {
    return await this.crearRolUseCase.ejecutar(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listar(): Promise<Rol[]> {
    return await this.listarRolesUseCase.ejecutar();
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarRolDto,
  ): Promise<Rol> {
    return await this.actualizarRolUseCase.ejecutar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.eliminarRolUseCase.ejecutar(id);
  }
}