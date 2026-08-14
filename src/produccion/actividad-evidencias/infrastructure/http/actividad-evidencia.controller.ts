import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { registrarActividadEvidenciaUseCase } from "../../aplicattion/use-cases/registrar-actividad-evidencia.use-case";
import { listarActividadEvidenciaUseCase } from "../../aplicattion/use-cases/listar-actividad-evidencia.use-case";
import { AgregarImagenActividadEvidenciaUseCase } from "../../aplicattion/use-cases/agregar-actividad-evidencia.use-case";
import { registrarActividadEvidenciaDto } from "../../aplicattion/dto/registrar-actividad-evidencia.dto";
import { agregarImagenEvidenciaDto } from "../../aplicattion/dto/crear-actividad-evidencia.dto";
import { eliminarEvidenciaActividadUseCase } from "../../aplicattion/use-cases/eliminar-actividad.evidencia.use-case";

@Controller('actividades/:actividadId/evidencias')
    export class actividadEvidenciaController {
        constructor(
            private readonly registrarEvidenciaUC: registrarActividadEvidenciaUseCase,
            private readonly listarEvidenciaUC: listarActividadEvidenciaUseCase,
            private readonly agregarImagenUC: AgregarImagenActividadEvidenciaUseCase,
            private readonly eliminarEvidenciaUC: eliminarEvidenciaActividadUseCase,
        ) {}

        @Post()
        registrar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: registrarActividadEvidenciaDto ) {
            return this.registrarEvidenciaUC.ejecutar(actividadId, dto);
        }

        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarEvidenciaUC.ejecutar(actividadId);
        }

        @Patch(':id/imagenes')
        agregarImagen(@Param('id', ParseIntPipe) id: number, @Body() dto: agregarImagenEvidenciaDto) {
            return this.agregarImagenUC.ejecutar(id, dto.url);
        }

        @Delete(':id')
        eliminar(@Param('id', ParseIntPipe) id: number) {
            return this.eliminarEvidenciaUC.ejecutar(id);
        }
    } 
