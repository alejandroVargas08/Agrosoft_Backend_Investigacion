import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { crearActividadesUseCase } from "../../aplicattion/use-cases/crear-actividades.use-case";
import { listarActividadesUseCase } from "../../aplicattion/use-cases/listar-actividades.use-case";
import { actualizarActividadesUseCase } from "../../aplicattion/use-cases/actualizar-actividades.use-case";
import { cambiarActividadesUseCase } from "../../aplicattion/use-cases/cambiar-actividades.use-case";
import { crearActividadesDto } from "../../aplicattion/dto/crear-actividades.dto";
import { eliminarActividadesUseCase } from "../../aplicattion/use-cases/eliminar-actividades.use-case";
import { actualizarActividadesDto } from "../../aplicattion/dto/actualizar-actividades.dto";
import { estadoActividad } from "../../domain/entities/actividades.entity";

@Controller('actividades')
    export class ActividadesController {
        constructor(
            private readonly crearActividadesUC: crearActividadesUseCase,
            private readonly listarActividadesUC: listarActividadesUseCase,
            private readonly actualizarActividadesUC: actualizarActividadesUseCase,
            private readonly cambiarActividadesUC: cambiarActividadesUseCase,
            private readonly eliminarActividadesUC: eliminarActividadesUseCase,
        ) {}

        @Post()
        async crear(@Body() dto: crearActividadesDto) {
            const dtoFecha = {
                ...dto,
                fecha: new Date(dto.fecha)
            };
            return await this.crearActividadesUC.execute(dtoFecha);
        }

        @Get('cultivo/:cultivoId')
        async listarPorCultivo(@Param('cultivoId', ParseIntPipe) cultivoId: number) {
            return await this.listarActividadesUC.execute(cultivoId);
        }

        @Patch(':id')
        async actualizar(
            @Param('id', ParseIntPipe) id: number,
            @Body() dto: actualizarActividadesDto,
        ) {
            const dtoFecha = dto.fecha
            ? { ...dto, fecha: new Date(dto.fecha)}
            : dto;

        return await this.actualizarActividadesUC.execute(id, dtoFecha);
        }

        @Patch(':id/estado')
        async cambiarEstado(
            @Param('id', ParseIntPipe) id: number,
            @Body('estado') estado: string,
        ) {
            return await this.cambiarActividadesUC.execute(id, estado as estadoActividad);
        }

        @Delete(':id')
        async eliminar(@Param('id', ParseIntPipe) id: number) {
            await this.eliminarActividadesUC.execute(id);
            return { message: `Actividad con ID ${id} eliminada correctamente` };
        }
    }