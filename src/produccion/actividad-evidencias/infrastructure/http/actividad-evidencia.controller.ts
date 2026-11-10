import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { registrarActividadEvidenciaUseCase } from '../../aplicattion/use-cases/registrar-actividad-evidencia.use-case';
import { listarActividadEvidenciaUseCase } from '../../aplicattion/use-cases/listar-actividad-evidencia.use-case';
import { AgregarImagenActividadEvidenciaUseCase } from '../../aplicattion/use-cases/agregar-actividad-evidencia.use-case';
import { registrarActividadEvidenciaDto } from '../../aplicattion/dto/registrar-actividad-evidencia.dto';
import { agregarImagenEvidenciaDto } from '../../aplicattion/dto/crear-actividad-evidencia.dto';
import { eliminarEvidenciaActividadUseCase } from '../../aplicattion/use-cases/eliminar-actividad.evidencia.use-case';
import { AccesoActividad } from '../../../actividades/infrastructure/http/acceso-actividad.decorator';
import { PermitirEjecutor } from '../../../actividades/infrastructure/http/permitir-ejecutor.decorator';

const CARPETA_EVIDENCIAS = path.join(process.cwd(), 'uploads', 'evidencias');
const TAMANO_MAXIMO = 10 * 1024 * 1024;
const EXTENSIONES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

interface FotoSubida {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

@Controller('actividades/:actividadId/evidencias')
@AccesoActividad()
@PermitirEjecutor()
export class actividadEvidenciaController {
  constructor(
    private readonly registrarEvidenciaUC: registrarActividadEvidenciaUseCase,
    private readonly listarEvidenciaUC: listarActividadEvidenciaUseCase,
    private readonly agregarImagenUC: AgregarImagenActividadEvidenciaUseCase,
    private readonly eliminarEvidenciaUC: eliminarEvidenciaActividadUseCase,
  ) {}

  @Post()
  registrar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: registrarActividadEvidenciaDto) {
    return this.registrarEvidenciaUC.ejecutar(actividadId, dto);
  }

  @Post('fotos')
  @UseInterceptors(
    FileInterceptor('foto', {
      limits: { fileSize: TAMANO_MAXIMO },
      fileFilter: (_req, archivo, callback) => callback(null, archivo.mimetype in EXTENSIONES),
    }),
  )
  async subirFoto(
    @Param('actividadId', ParseIntPipe) actividadId: number,
    @UploadedFile() foto: FotoSubida | undefined,
    @Body('descripcion') descripcion: string | undefined,
    @Req() req: Request,
  ) {
    if (!foto) {
      throw new BadRequestException('Envía una imagen JPG, PNG o WEBP de máximo 10 MB en el campo "foto"');
    }
    await fs.mkdir(CARPETA_EVIDENCIAS, { recursive: true });
    const nombre = `act${actividadId}-${Date.now()}-${randomUUID().slice(0, 8)}${EXTENSIONES[foto.mimetype]}`;
    await fs.writeFile(path.join(CARPETA_EVIDENCIAS, nombre), foto.buffer);

    const url = `${req.protocol}://${req.get('host')}/uploads/evidencias/${nombre}`;
    return this.registrarEvidenciaUC.ejecutar(actividadId, {
      descripcion: descripcion?.trim() || undefined,
      imagenes: [url],
    });
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
