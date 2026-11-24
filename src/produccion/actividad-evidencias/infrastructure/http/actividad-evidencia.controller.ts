import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
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
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from '../../../actividades/domain/ports/actividad-asignaciones.repository.port';
import type { ActividadAsignacionesRepositoryPort } from '../../../actividades/domain/ports/actividad-asignaciones.repository.port';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';

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

interface ConEntrega extends ConImagenes {
  asignacionId: number | null;
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
    @Inject(ACTIVIDAD_ASIGNACIONES_REPOSITORY)
    private readonly asignaciones: ActividadAsignacionesRepositoryPort,
  ) {}

  /**
   * La entrega a la que va lo que se sube. Si quien sube es un aprendiz con
   * esta actividad asignada, es siempre la suya, la mande o no el cliente
   * (la app de escritorio no la manda); así el instructor la ve en Por
   * revisar y nadie puede colgar fotos en la entrega de otro. El instructor
   * no tiene entrega: lo suyo queda en la actividad.
   */
  private async entregaDe(actividadId: number, req: Request, pedida?: unknown): Promise<number | undefined> {
    const usuario = (req as Request & { usuarioAutenticado?: UsuarioAutenticado }).usuarioAutenticado;
    if (usuario) {
      const propia = await this.asignaciones.buscarPorActividadYAprendiz(actividadId, usuario.id);
      if (propia?.id) return propia.id;
    }
    const numero = Number(pedida);
    return Number.isInteger(numero) && numero > 0 ? numero : undefined;
  }

  @Post()
  async registrar(
    @Param('actividadId', ParseIntPipe) actividadId: number,
    @Body() dto: registrarActividadEvidenciaDto,
    @Req() req: Request,
  ) {
    const evidencia = await this.registrarEvidenciaUC.ejecutar(actividadId, {
      ...dto,
      imagenes: (dto.imagenes ?? []).map(relativa),
      asignacionId: await this.entregaDe(actividadId, req, dto.asignacionId),
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
    @Body('asignacionId') asignacionId: string | undefined,
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
      // El aprendiz sube la foto dentro de su entrega: sin esto el instructor no la ve en Por revisar
      asignacionId: await this.entregaDe(actividadId, req, asignacionId),
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
    const todas = (await this.listarEvidenciaUC.ejecutar(actividadId)) as unknown as ConEntrega[];
    if (entrega === undefined || !Number.isInteger(entrega)) {
      return todas.map((evidencia) => conUrls(evidencia, req));
    }

    // Las fotos subidas sin entrega (antes de este arreglo, o desde la app de
    // escritorio) solo se pueden atribuir con seguridad si la actividad tiene
    // un único aprendiz asignado: en ese caso son de él.
    const asignadas = await this.asignaciones.listarPorActividad(actividadId);
    const unicaEntrega = asignadas.length === 1 && asignadas[0].id === entrega;
    return todas
      .filter((e) => e.asignacionId === entrega || (unicaEntrega && e.asignacionId == null))
      .map((evidencia) => conUrls(evidencia, req));
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
