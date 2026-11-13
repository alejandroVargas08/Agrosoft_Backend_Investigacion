import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { iaModule } from '../ia/ia.module';
import { IamModule } from '../modules/iam/iam.module';
import { TerritorioModule } from '../modules/territorio/territorio.module';
import { DronesModule } from '../drones/drones.module';

import { DisenoTerrenoController } from './infrastructure/http/diseno-terreno.controller';
import { CultivoAptitudOrmEntity } from './infrastructure/persistence/entities/cultivo-aptitud.orm-entity';
import { EvaluacionTerrenoOrmEntity } from './infrastructure/persistence/entities/evaluacion-terreno.orm-entity';
import { CultivoAptitudRepository } from './infrastructure/persistence/repositories/cultivo-aptitud.repository';
import { EvaluacionTerrenoRepository } from './infrastructure/persistence/repositories/evaluacion-terreno.repository';
import { ElevacionConRespaldoAdapter, GoogleElevacionAdapter, OpenMeteoElevacionAdapter } from './infrastructure/externos/elevacion.adapters';
import { OpenMeteoClimaAdapter } from './infrastructure/externos/open-meteo-clima.adapter';
import { SoilGridsSueloAdapter } from './infrastructure/externos/soilgrids-suelo.adapter';
import { GoogleStaticMapsAdapter } from './infrastructure/externos/google-static-maps.adapter';
import { EsriImagenSatelitalAdapter } from './infrastructure/externos/esri-imagen-satelital.adapter';
import { InterpreteCoberturaOllamaAdapter } from './infrastructure/ia/interprete-cobertura-ollama.adapter';
import { OsmObjetosAdapter } from './infrastructure/externos/osm-objetos.adapter';
import { MicrosoftEdificiosAdapter } from './infrastructure/externos/microsoft-edificios.adapter';
import { ObjetosCombinadosAdapter } from './infrastructure/externos/objetos-combinados.adapter';
import { DetectorCuadriculaOllamaAdapter } from './infrastructure/ia/detector-cuadricula-ollama.adapter';

import {
  DETECTOR_CUADRICULA_TOKEN,
  INTERPRETE_COBERTURA_TOKEN,
  PROVEEDOR_CLIMA_TOKEN,
  PROVEEDOR_ELEVACION_TOKEN,
  PROVEEDOR_IMAGEN_SATELITAL_TOKEN,
  PROVEEDOR_OBJETOS_TOKEN,
  PROVEEDOR_SUELO_TOKEN,
} from './domain/ports/proveedores-geo.port';
import { CULTIVO_APTITUD_REPOSITORY_TOKEN, EVALUACION_TERRENO_REPOSITORY_TOKEN } from './domain/ports/repositorios.port';

import { AnalizadorTopografiaService } from './application/services/analizador-topografia.service';
import { AnalizadorCoberturaService } from './application/services/analizador-cobertura.service';
import { DetectorObjetosDronService } from './application/services/detector-objetos-dron.service';
import { SolicitarEvaluacionTerrenoUseCase } from './application/use-cases/solicitar-evaluacion-terreno.use-case';
import { ProcesarEvaluacionTerrenoUseCase } from './application/use-cases/procesar-evaluacion-terreno.use-case';
import { ListarEvaluacionesTerrenoUseCase, ObtenerEvaluacionTerrenoUseCase } from './application/use-cases/consultar-evaluaciones.use-case';
import { DisenarCultivoUseCase, ListarCultivosAptitudUseCase } from './application/use-cases/disenar-cultivo.use-case';

@Module({
  imports: [
    iaModule,
    IamModule,
    TerritorioModule,
    DronesModule,
    TypeOrmModule.forFeature([CultivoAptitudOrmEntity, EvaluacionTerrenoOrmEntity]),
  ],
  controllers: [DisenoTerrenoController],
  providers: [
    AnalizadorTopografiaService,
    AnalizadorCoberturaService,
    DetectorObjetosDronService,
    SolicitarEvaluacionTerrenoUseCase,
    ProcesarEvaluacionTerrenoUseCase,
    ObtenerEvaluacionTerrenoUseCase,
    ListarEvaluacionesTerrenoUseCase,
    DisenarCultivoUseCase,
    ListarCultivosAptitudUseCase,

    { provide: CULTIVO_APTITUD_REPOSITORY_TOKEN, useClass: CultivoAptitudRepository },
    { provide: EVALUACION_TERRENO_REPOSITORY_TOKEN, useClass: EvaluacionTerrenoRepository },

    GoogleElevacionAdapter,
    OpenMeteoElevacionAdapter,
    {
      provide: PROVEEDOR_ELEVACION_TOKEN,
      inject: [GoogleElevacionAdapter, OpenMeteoElevacionAdapter],
      useFactory: (google: GoogleElevacionAdapter, openMeteo: OpenMeteoElevacionAdapter) =>
        process.env.GOOGLE_MAPS_API_KEY && process.env.TERRENO_ELEVACION !== 'open-meteo'
          ? new ElevacionConRespaldoAdapter(google, openMeteo)
          : openMeteo,
    },
    { provide: PROVEEDOR_CLIMA_TOKEN, useClass: OpenMeteoClimaAdapter },
    { provide: PROVEEDOR_SUELO_TOKEN, useClass: SoilGridsSueloAdapter },
    GoogleStaticMapsAdapter,
    EsriImagenSatelitalAdapter,
    {
      provide: PROVEEDOR_IMAGEN_SATELITAL_TOKEN,
      inject: [GoogleStaticMapsAdapter, EsriImagenSatelitalAdapter],
      useFactory: (google: GoogleStaticMapsAdapter, esri: EsriImagenSatelitalAdapter) =>
        process.env.GOOGLE_MAPS_API_KEY ? google : esri,
    },
    { provide: INTERPRETE_COBERTURA_TOKEN, useClass: InterpreteCoberturaOllamaAdapter },
    OsmObjetosAdapter,
    MicrosoftEdificiosAdapter,
    { provide: PROVEEDOR_OBJETOS_TOKEN, useClass: ObjetosCombinadosAdapter },
    { provide: DETECTOR_CUADRICULA_TOKEN, useClass: DetectorCuadriculaOllamaAdapter },
  ],
})
export class DisenoTerrenoModule {}
