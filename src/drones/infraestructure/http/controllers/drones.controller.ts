import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { CrearDronUseCase } from '../../../application/use-cases/drones/crear-dron.use-case';
import { ObtenerDronUseCase } from '../../../application/use-cases/drones/obtener-dron.use-case';
import { ListarDronesUseCase } from '../../../application/use-cases/drones/listar-drones.use-case';
import { EliminarDronUseCase } from '../../../application/use-cases/drones/eliminar-dron.use-case';
import { CrearDronDto } from '../../../application/dto/drones/crear-dron.dto';
import { PERMISOS_DRONES } from '../permisos-drones';

@Controller('drones')
@Autenticado()
export class DronesController {
  constructor(
    private readonly crearDronUseCase: CrearDronUseCase,
    private readonly obtenerDronUseCase: ObtenerDronUseCase,
    private readonly listarDronesUseCase: ListarDronesUseCase,
    private readonly eliminarDronUseCase: EliminarDronUseCase,
  ) {}

  @Post()
  @RequierePermisos(PERMISOS_DRONES.GESTIONAR_DRONES)
  crear(@Body() dto: CrearDronDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.crearDronUseCase.execute(dto, usuario.id);
  }

  @Get()
  @RequierePermisos(PERMISOS_DRONES.VER_DRONES)
  listar() {
    return this.listarDronesUseCase.execute();
  }

  @Get(':id')
  @RequierePermisos(PERMISOS_DRONES.VER_DRONES)
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerDronUseCase.execute(id);
  }

  @Delete(':id')
  @RequierePermisos(PERMISOS_DRONES.GESTIONAR_DRONES)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarDronUseCase.execute(id);
  }
}
