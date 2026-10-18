import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../iam/iam.module';

import { LoteOrmEntity } from './infrastructure/persistence/orm-entities/lote.orm-entity';
import { SubLoteOrmEntity } from './infrastructure/persistence/orm-entities/sublote.orm-entity';

import { LOTE_REPOSITORY_PORT } from './domain/ports/lote.repository.port';
import { SUBLOTE_REPOSITORY_PORT } from './domain/ports/sublote.repository.port';
import { ACCESO_LOTES_PORT } from './domain/ports/acceso-lotes.port';
import { LoteTypeOrmRepository } from './infrastructure/persistence/repositories/lote.typeorm-repository';
import { SubLoteTypeOrmRepository } from './infrastructure/persistence/repositories/sublote.typeorm-repository';
import { AccesoLotesService } from './application/services/acceso-lotes.service';

import { LoteController } from './infrastructure/http/lote.controller';
import { SubLoteController } from './infrastructure/http/sublote.controller';

import { CrearLoteUseCase } from './application/use-cases/crear-lote.use-case';
import { ListarLotesUseCase } from './application/use-cases/listar-lotes.use-case';
import { ObtenerLotePorIdUseCase } from './application/use-cases/obtener-lote-por-id.use-case';
import { CambiarEstadoLoteUseCase } from './application/use-cases/cambiar-estado-lote.use-case';
import { EliminarLoteUseCase } from './application/use-cases/eliminar-lote.use-case';
import { CrearSubLoteUseCase } from './application/use-cases/crear-sublote.use-case';
import { ListarSubLotesPorLoteUseCase } from './application/use-cases/listar-sublotes-por-lote.use-case';
import { CambiarEstadoSubLoteUseCase } from './application/use-cases/cambiar-estado-sublote.use-case';
import { EliminarSubLoteUseCase } from './application/use-cases/eliminar-sublote.use-case';

@Module({
    imports: [IamModule, TypeOrmModule.forFeature([LoteOrmEntity, SubLoteOrmEntity])],
    controllers: [LoteController, SubLoteController],
    providers: [
        CrearLoteUseCase,
        ListarLotesUseCase,
        ObtenerLotePorIdUseCase,
        CambiarEstadoLoteUseCase,
        EliminarLoteUseCase,
        CrearSubLoteUseCase,
        ListarSubLotesPorLoteUseCase,
        CambiarEstadoSubLoteUseCase,
        EliminarSubLoteUseCase,

        { provide: LOTE_REPOSITORY_PORT, useClass: LoteTypeOrmRepository },
        { provide: SUBLOTE_REPOSITORY_PORT, useClass: SubLoteTypeOrmRepository },
        AccesoLotesService,
        { provide: ACCESO_LOTES_PORT, useExisting: AccesoLotesService },
    ],
    exports: [ACCESO_LOTES_PORT],
})
export class TerritorioModule {}
