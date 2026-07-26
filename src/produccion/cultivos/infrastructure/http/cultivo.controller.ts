import { CrearCultivoUseCase } from "../../application/use-cases/crear.cultivo.use-case";
import { Body, Controller, Param, Post, Get, Query, ParseIntPipe, Patch, Delete } from "@nestjs/common";
import { listarCultivoUseCase } from "../../application/use-cases/listar.cultivos.use-case";
import { CrearCultivoDto } from "../../application/dtos/crear-cultivo.dto";
import { ActualizarCultivoUseCase } from "../../application/use-cases/actualizar.cultivo.use.case";
import { ObtenerCultivoUseCase } from "../../application/use-cases/obtener.cultivo.use-case";
import { finalizarCultivoUseCase } from "../../application/use-cases/finalizar.cultivo.use-case";
import { eliminarCultivoUseCase } from "../../application/use-cases/eliminar.cultivo.use-case";

@Controller('cultivos')
export class CultivoController {
    constructor( 
        private readonly crearCultivoUC: CrearCultivoUseCase,
        private readonly listarCultivoUC: listarCultivoUseCase,
        private readonly obtenerCultivoUC: ObtenerCultivoUseCase,
        private readonly actualizarCultivoUC: ActualizarCultivoUseCase,
        private readonly finalizarCultivoUC: finalizarCultivoUseCase,
        private readonly eliminarCultivoUC: eliminarCultivoUseCase, 
    ) {}

        @Post()
        async crear(@Body() dto: CrearCultivoDto) {
            return await this.crearCultivoUC.ejecutar(dto);
        }

        @Get()
        listar(@Query('loteId', ParseIntPipe) loteId: number) {
            return this.listarCultivoUC.ejecutar(loteId);
        }

        @Get(':id')
        async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
            return await this.obtenerCultivoUC.ejecutar(id);
        }

        @Patch(':id')
        async actualizar(@Param('id', ParseIntPipe) id: number,
                @Body() datosActualizados: any,
        ) { return await this.actualizarCultivoUC.ejecutar(id, (datosActualizados));
        }

        @Patch(':id/finalizar')
        async finalizar(@Param('id', ParseIntPipe) id: number,
        @Body('fechaFinalizacion') fechaFinalizacion: string,) {
            return await this.finalizarCultivoUC.ejecutar(id, new Date(fechaFinalizacion));
        }

        @Delete(':id')
        async eliminar(@Param('id', ParseIntPipe) id: number) {
            return await this.eliminarCultivoUC.ejecutar(id);
        }
}