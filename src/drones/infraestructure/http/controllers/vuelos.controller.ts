import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CrearVueloUseCase } from '../../../application/use-cases/vuelos/crear-vuelo.use-case';
import { ObtenerVueloUseCase } from '../../../application/use-cases/vuelos/obtener-vuelo.use-case';
import { ListarVuelosUseCase } from '../../../application/use-cases/vuelos/listar-vuelos.use-case';
import { EliminarVueloUseCase } from '../../../application/use-cases/vuelos/eliminar-vuelo.use-case';
import { CargarArchivosVueloUseCase } from '../../../application/use-cases/capturas/cargar-archivos-vuelo.use-case';
import { ListarCapturasPorVueloUseCase } from '../../../application/use-cases/capturas/listar-capturas-por-vuelo.use-case';
import { SolicitarAnalisisVueloUseCase } from '../../../application/use-cases/analisis/solicitar-analisis-vuelo.use-case';
import { ListarAnalisisPorVueloUseCase } from '../../../application/use-cases/analisis/listar-analisis-por-vuelo.use-case';
import { CrearVueloDto } from '../../../application/dto/vuelos/crear-vuelo.dto';
import { ListarVuelosQueryDto } from '../../../application/dto/vuelos/listar-vuelos.query.dto';
import { SolicitarAnalisisDto } from '../../../application/dto/analisis/solicitar-analisis.dto';

const MAX_ARCHIVOS_POR_CARGA = 60;
const MAX_TAMANO_ARCHIVO = 60 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = /\.(jpe?g|tiff?)$/i;

interface ArchivoSubido {
  path: string;
  originalname: string;
}

@Controller('vuelos')
export class VuelosController {
  constructor(
    private readonly crearVueloUseCase: CrearVueloUseCase,
    private readonly obtenerVueloUseCase: ObtenerVueloUseCase,
    private readonly listarVuelosUseCase: ListarVuelosUseCase,
    private readonly eliminarVueloUseCase: EliminarVueloUseCase,
    private readonly cargarArchivosVueloUseCase: CargarArchivosVueloUseCase,
    private readonly listarCapturasPorVueloUseCase: ListarCapturasPorVueloUseCase,
    private readonly solicitarAnalisisVueloUseCase: SolicitarAnalisisVueloUseCase,
    private readonly listarAnalisisPorVueloUseCase: ListarAnalisisPorVueloUseCase,
  ) {}

  @Post()
  crear(@Body() dto: CrearVueloDto) {
    return this.crearVueloUseCase.execute(dto);
  }

  @Get()
  listar(@Query() query: ListarVuelosQueryDto) {
    return this.listarVuelosUseCase.execute({ loteId: query.loteId, dronId: query.dronId });
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.obtenerVueloUseCase.execute(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.eliminarVueloUseCase.execute(id);
  }

  @Post(':id/archivos')
  @UseInterceptors(
    FilesInterceptor('archivos', MAX_ARCHIVOS_POR_CARGA, {
      dest: path.join(os.tmpdir(), 'agrosoft-drones'),
      limits: { fileSize: MAX_TAMANO_ARCHIVO },
      fileFilter: (_req, archivo, callback) => {
        callback(null, EXTENSIONES_PERMITIDAS.test(archivo.originalname));
      },
    }),
  )
  async cargarArchivos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() archivos: ArchivoSubido[] = [],
  ) {
    if (archivos.length === 0) {
      throw new BadRequestException('Envía al menos una imagen JPG o TIF en el campo "archivos"');
    }
    try {
      return await this.cargarArchivosVueloUseCase.execute(
        id,
        archivos.map((a) => ({ rutaTemporal: a.path, nombreOriginal: path.basename(a.originalname) })),
      );
    } finally {
      await Promise.all(archivos.map((a) => fs.rm(a.path, { force: true })));
    }
  }

  @Get(':id/capturas')
  listarCapturas(@Param('id', ParseIntPipe) id: number) {
    return this.listarCapturasPorVueloUseCase.execute(id);
  }

  @Post(':id/analisis')
  @HttpCode(HttpStatus.ACCEPTED)
  solicitarAnalisis(@Param('id', ParseIntPipe) id: number, @Body() dto: SolicitarAnalisisDto) {
    return this.solicitarAnalisisVueloUseCase.execute(id, dto);
  }

  @Get(':id/analisis')
  listarAnalisis(@Param('id', ParseIntPipe) id: number) {
    return this.listarAnalisisPorVueloUseCase.execute(id);
  }
}
