import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, StreamableFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Autenticado } from '../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';
import { RequierePermisos } from '../../../../modules/iam/infrastructure/http/decorators/requiere-permisos.decorator';
import { UsuarioActual } from '../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { CrearVueloUseCase } from '../../../application/use-cases/vuelos/crear-vuelo.use-case';
import { ObtenerVueloUseCase } from '../../../application/use-cases/vuelos/obtener-vuelo.use-case';
import { ListarVuelosUseCase } from '../../../application/use-cases/vuelos/listar-vuelos.use-case';
import { EliminarVueloUseCase } from '../../../application/use-cases/vuelos/eliminar-vuelo.use-case';
import { CargarArchivosVueloUseCase } from '../../../application/use-cases/capturas/cargar-archivos-vuelo.use-case';
import { ListarCapturasPorVueloUseCase } from '../../../application/use-cases/capturas/listar-capturas-por-vuelo.use-case';
import {
  BANDAS_VALIDAS,
  CAPAS_VALIDAS,
  ImagenGenerada,
  ImagenesCapturaUseCase,
  TamanoImagen,
} from '../../../application/use-cases/capturas/imagenes-captura.use-case';
import type { CapaCaptura } from '../../../domain/services/coloreador-capas.service';
import type { Banda } from '../../../domain/value-objects/archivo-dji.vo';
import { SolicitarAnalisisVueloUseCase } from '../../../application/use-cases/analisis/solicitar-analisis-vuelo.use-case';
import { ListarAnalisisPorVueloUseCase } from '../../../application/use-cases/analisis/listar-analisis-por-vuelo.use-case';
import { CrearVueloDto } from '../../../application/dto/vuelos/crear-vuelo.dto';
import { ListarVuelosQueryDto } from '../../../application/dto/vuelos/listar-vuelos.query.dto';
import { SolicitarAnalisisDto } from '../../../application/dto/analisis/solicitar-analisis.dto';
import { PERMISOS_DRONES } from '../permisos-drones';

const MAX_ARCHIVOS_POR_CARGA = 60;
const MAX_TAMANO_ARCHIVO = 60 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = /\.(jpe?g|tiff?)$/i;

interface ArchivoSubido {
  path: string;
  originalname: string;
}

@Controller('vuelos')
@Autenticado()
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
    private readonly imagenesCapturaUseCase: ImagenesCapturaUseCase,
  ) {}

  @Post()
  @RequierePermisos(PERMISOS_DRONES.GESTIONAR_VUELOS)
  crear(@Body() dto: CrearVueloDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.crearVueloUseCase.execute(dto, usuario);
  }

  @Get()
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  listar(@Query() query: ListarVuelosQueryDto, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.listarVuelosUseCase.execute({ loteId: query.loteId, dronId: query.dronId }, usuario);
  }

  @Get(':id')
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.obtenerVueloUseCase.execute(id, usuario);
  }

  @Delete(':id')
  @RequierePermisos(PERMISOS_DRONES.GESTIONAR_VUELOS)
  eliminar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.eliminarVueloUseCase.execute(id, usuario);
  }

  @Post(':id/archivos')
  @RequierePermisos(PERMISOS_DRONES.CARGAR_IMAGENES)
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
    @UsuarioActual() usuario: UsuarioAutenticado,
    @UploadedFiles() archivos: ArchivoSubido[] = [],
  ) {
    try {
      if (archivos.length === 0) {
        throw new BadRequestException('Envía al menos una imagen JPG o TIF en el campo "archivos"');
      }
      return await this.cargarArchivosVueloUseCase.execute(
        id,
        archivos.map((a) => ({ rutaTemporal: a.path, nombreOriginal: path.basename(a.originalname) })),
        usuario,
      );
    } finally {
      await Promise.all(archivos.map((a) => fs.rm(a.path, { force: true })));
    }
  }

  @Get(':id/capturas')
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  listarCapturas(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.listarCapturasPorVueloUseCase.execute(id, usuario);
  }

  @Get(':id/capturas/:capturaId/imagen')
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  async imagenCaptura(
    @Param('id', ParseIntPipe) id: number,
    @Param('capturaId', ParseIntPipe) capturaId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('banda') banda = 'RGB',
    @Query('tamano') tamano = 'miniatura',
  ) {
    const bandaNormalizada = banda.toUpperCase() as Banda;
    if (!BANDAS_VALIDAS.includes(bandaNormalizada)) {
      throw new BadRequestException(`Banda no válida. Usa: ${BANDAS_VALIDAS.join(', ')}`);
    }
    if (tamano !== 'miniatura' && tamano !== 'completa') {
      throw new BadRequestException('El tamaño debe ser "miniatura" o "completa"');
    }
    const imagen = await this.imagenesCapturaUseCase.imagen(id, capturaId, bandaNormalizada, tamano as TamanoImagen, usuario);
    return this.archivo(imagen);
  }

  @Get(':id/capturas/:capturaId/capa')
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  async capaCaptura(
    @Param('id', ParseIntPipe) id: number,
    @Param('capturaId', ParseIntPipe) capturaId: number,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Query('indice') indice = 'NDVI',
  ) {
    const capa = indice.toUpperCase() as CapaCaptura;
    if (!CAPAS_VALIDAS.includes(capa)) {
      throw new BadRequestException(`Índice no válido. Usa: ${CAPAS_VALIDAS.join(', ')}`);
    }
    const imagen = await this.imagenesCapturaUseCase.capa(id, capturaId, capa, usuario);
    return this.archivo(imagen);
  }

  @Post(':id/analisis')
  @HttpCode(HttpStatus.ACCEPTED)
  @RequierePermisos(PERMISOS_DRONES.SOLICITAR_ANALISIS)
  solicitarAnalisis(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SolicitarAnalisisDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ) {
    return this.solicitarAnalisisVueloUseCase.execute(id, dto, usuario);
  }

  @Get(':id/analisis')
  @RequierePermisos(PERMISOS_DRONES.VER_VUELOS)
  listarAnalisis(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
    return this.listarAnalisisPorVueloUseCase.execute(id, usuario);
  }

  private archivo(imagen: ImagenGenerada): StreamableFile {
    return new StreamableFile(imagen.contenido, { type: imagen.tipo });
  }
}
