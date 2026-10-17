import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DronesController } from './infraestructure/http/controllers/drones.controller';
import { VuelosController } from './infraestructure/http/controllers/vuelos.controller';
import { AnalisisVueloController } from './infraestructure/http/controllers/analisis-vuelo.controller';

import { DronOrmEntity } from './infraestructure/persistence/entities/dron.orm-entity';
import { VueloOrmEntity } from './infraestructure/persistence/entities/vuelo.orm-entity';
import { CapturaOrmEntity } from './infraestructure/persistence/entities/captura.orm-entity';
import { AnalisisVueloOrmEntity } from './infraestructure/persistence/entities/analisis-vuelo.orm-entity';
import { ResultadoCapturaOrmEntity } from './infraestructure/persistence/entities/resultado-captura.orm-entity';

import { DronRepository } from './infraestructure/persistence/repositories/dron.repository';
import { VueloRepository } from './infraestructure/persistence/repositories/vuelo.repository';
import { CapturaRepository } from './infraestructure/persistence/repositories/captura.repository';
import { AnalisisVueloRepository } from './infraestructure/persistence/repositories/analisis-vuelo.repository';
import { ResultadoCapturaRepository } from './infraestructure/persistence/repositories/resultado-captura.repository';

import { AlmacenamientoLocalAdapter } from './infraestructure/storage/almacenamiento-local.adapter';
import { ExtractorMetadatosDjiAdapter } from './infraestructure/procesamiento/extractor-metadatos-dji.adapter';
import { ProcesadorMultiespectralGeotiffAdapter } from './infraestructure/procesamiento/procesador-multiespectral-geotiff.adapter';

import { DRON_REPOSITORY_TOKEN } from './domain/ports/dron.repository.token';
import { VUELO_REPOSITORY_TOKEN } from './domain/ports/vuelo.repository.token';
import { CAPTURA_REPOSITORY_TOKEN } from './domain/ports/captura.repository.token';
import { ANALISIS_VUELO_REPOSITORY_TOKEN } from './domain/ports/analisis-vuelo.repository.token';
import { RESULTADO_CAPTURA_REPOSITORY_TOKEN } from './domain/ports/resultado-captura.repository.token';
import { ALMACENAMIENTO_ARCHIVOS_TOKEN } from './domain/ports/almacenamiento-archivos.token';
import { EXTRACTOR_METADATOS_TOKEN } from './domain/ports/extractor-metadatos.token';
import { PROCESADOR_MULTIESPECTRAL_TOKEN } from './domain/ports/procesador-multiespectral.token';

import { CrearDronUseCase } from './application/use-cases/drones/crear-dron.use-case';
import { ObtenerDronUseCase } from './application/use-cases/drones/obtener-dron.use-case';
import { ListarDronesUseCase } from './application/use-cases/drones/listar-drones.use-case';
import { EliminarDronUseCase } from './application/use-cases/drones/eliminar-dron.use-case';

import { CrearVueloUseCase } from './application/use-cases/vuelos/crear-vuelo.use-case';
import { ObtenerVueloUseCase } from './application/use-cases/vuelos/obtener-vuelo.use-case';
import { ListarVuelosUseCase } from './application/use-cases/vuelos/listar-vuelos.use-case';
import { EliminarVueloUseCase } from './application/use-cases/vuelos/eliminar-vuelo.use-case';

import { CargarArchivosVueloUseCase } from './application/use-cases/capturas/cargar-archivos-vuelo.use-case';
import { ListarCapturasPorVueloUseCase } from './application/use-cases/capturas/listar-capturas-por-vuelo.use-case';

import { SolicitarAnalisisVueloUseCase } from './application/use-cases/analisis/solicitar-analisis-vuelo.use-case';
import { ProcesarAnalisisVueloUseCase } from './application/use-cases/analisis/procesar-analisis-vuelo.use-case';
import { ObtenerAnalisisUseCase } from './application/use-cases/analisis/obtener-analisis.use-case';
import { ListarAnalisisPorVueloUseCase } from './application/use-cases/analisis/listar-analisis-por-vuelo.use-case';
import { ListarResultadosAnalisisUseCase } from './application/use-cases/analisis/listar-resultados-analisis.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DronOrmEntity,
      VueloOrmEntity,
      CapturaOrmEntity,
      AnalisisVueloOrmEntity,
      ResultadoCapturaOrmEntity,
    ]),
  ],
  controllers: [DronesController, VuelosController, AnalisisVueloController],
  providers: [
    CrearDronUseCase,
    ObtenerDronUseCase,
    ListarDronesUseCase,
    EliminarDronUseCase,
    { provide: DRON_REPOSITORY_TOKEN, useClass: DronRepository },

    CrearVueloUseCase,
    ObtenerVueloUseCase,
    ListarVuelosUseCase,
    EliminarVueloUseCase,
    { provide: VUELO_REPOSITORY_TOKEN, useClass: VueloRepository },

    CargarArchivosVueloUseCase,
    ListarCapturasPorVueloUseCase,
    { provide: CAPTURA_REPOSITORY_TOKEN, useClass: CapturaRepository },

    SolicitarAnalisisVueloUseCase,
    ProcesarAnalisisVueloUseCase,
    ObtenerAnalisisUseCase,
    ListarAnalisisPorVueloUseCase,
    ListarResultadosAnalisisUseCase,
    { provide: ANALISIS_VUELO_REPOSITORY_TOKEN, useClass: AnalisisVueloRepository },
    { provide: RESULTADO_CAPTURA_REPOSITORY_TOKEN, useClass: ResultadoCapturaRepository },

    { provide: ALMACENAMIENTO_ARCHIVOS_TOKEN, useClass: AlmacenamientoLocalAdapter },
    { provide: EXTRACTOR_METADATOS_TOKEN, useClass: ExtractorMetadatosDjiAdapter },
    { provide: PROCESADOR_MULTIESPECTRAL_TOKEN, useClass: ProcesadorMultiespectralGeotiffAdapter },
  ],
  exports: [VUELO_REPOSITORY_TOKEN, ANALISIS_VUELO_REPOSITORY_TOKEN, RESULTADO_CAPTURA_REPOSITORY_TOKEN],
})
export class DronesModule {}

