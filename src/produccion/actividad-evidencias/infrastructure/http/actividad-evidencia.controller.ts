import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
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
const RUTA_PUBLICA = '/uploads/';
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

interface ConImagenes {
  imagenes: string[];
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
  async registrar(
    @Param('actividadId', ParseIntPipe) actividadId: number,
    @Body() dto: registrarActividadEvidenciaDto,
    @Req() req: Request,
  ) {
    const evidencia = await this.registrarEvidenciaUC.ejecutar(actividadId, {
      ...dto,
      imagenes: (dto.imagenes ?? []).map(relativa),
    });
    return conUrls(evidencia, req);
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

    const evidencia = await this.registrarEvidenciaUC.ejecutar(actividadId, {
      descripcion: descripcion?.trim() || undefined,
      imagenes: [`${RUTA_PUBLICA}evidencias/${nombre}`],
    });
    return conUrls(evidencia, req);
  }

  @Get()
  async listar(
    @Param('actividadId', ParseIntPipe) actividadId: number,
    @Req() req: Request,
    @Query('asignacionId') asignacionId?: string,
  ) {
    const entrega = asignacionId !== undefined ? Number(asignacionId) : undefined;
    const evidencias = await this.listarEvidenciaUC.ejecutar(
      actividadId,
      Number.isInteger(entrega) ? entrega : undefined,
    );
    return evidencias.map((evidencia) => conUrls(evidencia, req));
  }

  @Patch(':id/imagenes')
  async agregarImagen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: agregarImagenEvidenciaDto,
    @Req() req: Request,
  ) {
    const evidencia = await this.agregarImagenUC.ejecutar(id, relativa(dto.url));
    return conUrls(evidencia, req);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarEvidenciaUC.ejecutar(id);
  }
}

function relativa(url: string): string {
  const indice = url.indexOf(RUTA_PUBLICA);
  return indice >= 0 ? url.slice(indice) : url;
}

function absoluta(url: string, req: Request): string {
  const ruta = relativa(url);
  if (!ruta.startsWith(RUTA_PUBLICA)) return url;
  return `${req.protocol}://${req.get('host')}${ruta}`;
}

function conUrls<T extends ConImagenes>(evidencia: T, req: Request): T {
  if (!evidencia || !Array.isArray(evidencia.imagenes)) return evidencia;
  return { ...evidencia, imagenes: evidencia.imagenes.map((url) => absoluta(url, req)) };
}
