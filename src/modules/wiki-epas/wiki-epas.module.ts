// Nuevos imports
import { EpaTiposCultivosWikiController } from './infraestructure/http/controllers/epa-tipos-cultivos-wiki.controller';
import { EpaTipoCultivoWikiOrmEntity } from './infraestructure/persistence/entities/epa-tipo-cultivo-wiki.orm-entity';
import { EpaTipoCultivoWikiRepository } from './infraestructure/persistence/repositories/epa-tipo-cultivo-wiki.repository';
import { EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from './domain/ports/epa-tipo-cultivo-wiki.repository.token';

import { AsociarEpaTipoCultivoWikiUseCase } from './application/use-cases/epa-tipos-cultivos-wiki/asociar-epa-tipo-cultivo-wiki.use-case';
import { DesasociarEpaTipoCultivoWikiUseCase } from './application/use-cases/epa-tipos-cultivos-wiki/desasociar-epa-tipo-cultivo-wiki.use-case';
import { ListarTiposCultivoPorEpaUseCase } from './application/use-cases/epa-tipos-cultivos-wiki/listar-tipos-cultivo-por-epa.use-case';
import { ListarEpasPorTipoCultivoUseCase } from './application/use-cases/epa-tipos-cultivos-wiki/listar-epas-por-tipo-cultivo.use-case';

import { TiposCultivosWikiController } from './infraestructure/http/controllers/tipos-cultivos-wiki.controller';
import { TipoCultivoWikiOrmEntity } from './infraestructure/persistence/entities/tipo-cultivo-wiki.orm-entity';
import { TipoCultivoWikiRepository } from './infraestructure/persistence/repositories/tipo-cultivo-wiki.repository';
import { TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN } from './domain/ports/tipo-cultivo-wiki.repository.token';

import { CrearTipoCultivoWikiUseCase } from './application/use-cases/tipos-cultivos-wiki/crear-tipo-cultivo-wiki.use-case';
import { ObtenerTipoCultivoWikiUseCase } from './application/use-cases/tipos-cultivos-wiki/obtener-tipo-cultivo-wiki.use-case';
import { ListarTiposCultivosWikiUseCase } from './application/use-cases/tipos-cultivos-wiki/listar-tipos-cultivos-wiki.use-case';
import { ActualizarTipoCultivoWikiUseCase } from './application/use-cases/tipos-cultivos-wiki/actualizar-tipo-cultivo-wiki.use-case';
import { EliminarTipoCultivoWikiUseCase } from './application/use-cases/tipos-cultivos-wiki/eliminar-tipo-cultivo-wiki.use-case';

import { WikiTipoEpaController } from './infraestructure/http/controllers/wiki-tipo-epa.controller';
import { WikiTipoEpaOrmEntity } from './infraestructure/persistence/entities/wiki-tipo-epa.orm-entity';
import { WikiTipoEpaRepository } from './infraestructure/persistence/repositories/wiki-tipo-epa.repository';
import { WIKI_TIPO_EPA_REPOSITORY_TOKEN } from './domain/ports/wiki-tipo-epa.repository.token';

import { CrearWikiTipoEpaUseCase } from './application/use-cases/wiki-tipo-epa/crear-wiki-tipo-epa.use-case';
import { ObtenerWikiTipoEpaUseCase } from './application/use-cases/wiki-tipo-epa/obtener-wiki-tipo-epa.use-case';
import { ListarWikiTipoEpaUseCase } from './application/use-cases/wiki-tipo-epa/listar-wiki-tipo-epa.use-case';
import { ActualizarWikiTipoEpaUseCase } from './application/use-cases/wiki-tipo-epa/actualizar-wiki-tipo-epa.use-case';
import { EliminarWikiTipoEpaUseCase } from './application/use-cases/wiki-tipo-epa/eliminar-wiki-tipo-epa.use-case';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EpasController } from './infraestructure/http/controllers/epas.controller';
import { EpaOrmEntity } from './infraestructure/persistence/entities/epa.orm-entity';
import { EpaRepository } from './infraestructure/persistence/repositories/epa.repository';
import { EPA_REPOSITORY_TOKEN } from './domain/ports/epa.repository.token';

import { CrearEpaUseCase } from './application/use-cases/epas/crear-epa.use-case';
import { ObtenerEpaUseCase } from './application/use-cases/epas/obtener-epa.use-case';
import { ListarEpasUseCase } from './application/use-cases/epas/listar-epas.use-case';
import { ActualizarEpaUseCase } from './application/use-cases/epas/actualizar-epa.use-case';
import { EliminarEpaUseCase } from './application/use-cases/epas/eliminar-epa.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([EpaOrmEntity, WikiTipoEpaOrmEntity, TipoCultivoWikiOrmEntity, EpaTipoCultivoWikiOrmEntity,])],
  controllers: [EpasController, WikiTipoEpaController, TiposCultivosWikiController,
    EpaTiposCultivosWikiController,],
  providers: [
    CrearEpaUseCase,
    ObtenerEpaUseCase,
    ListarEpasUseCase,
    ActualizarEpaUseCase,
    EliminarEpaUseCase,
    { provide: EPA_REPOSITORY_TOKEN, useClass: EpaRepository },

    CrearWikiTipoEpaUseCase,
    ObtenerWikiTipoEpaUseCase,
    ListarWikiTipoEpaUseCase,
    ActualizarWikiTipoEpaUseCase,
    EliminarWikiTipoEpaUseCase,
    { provide: WIKI_TIPO_EPA_REPOSITORY_TOKEN, useClass: WikiTipoEpaRepository },

    CrearTipoCultivoWikiUseCase,
    ObtenerTipoCultivoWikiUseCase,
    ListarTiposCultivosWikiUseCase,
    ActualizarTipoCultivoWikiUseCase,
    EliminarTipoCultivoWikiUseCase,
    { provide: TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN, useClass: TipoCultivoWikiRepository },

    AsociarEpaTipoCultivoWikiUseCase,
    DesasociarEpaTipoCultivoWikiUseCase,
    ListarTiposCultivoPorEpaUseCase,
    ListarEpasPorTipoCultivoUseCase,
    { provide: EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN, useClass: EpaTipoCultivoWikiRepository },
  ],
  exports: [EPA_REPOSITORY_TOKEN, WIKI_TIPO_EPA_REPOSITORY_TOKEN, TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN,
    EPA_TIPO_CULTIVO_WIKI_REPOSITORY_TOKEN,],
})
export class WikiEpasModule {}