import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteProduccionOrmEntity } from './persistence/lote.produccion.orm-entity';
import { loteProduccionController } from './http/lote.produccion.controller';
import { CrearLoteProduccionUseCase } from '../application/use-cases/crear-lotes-produccion.uses-case';
import { listarLotesProduccionUseCase } from '../application/use-cases/listar.lotes.produccion.use-case';
import { ActualizarLoteProduccionUseCase } from '../application/use-cases/actualizar.lotes.produccion.use-case';
import { LoteProduccionRepositoryImpl } from './persistence/lote.produccion.repository.impl';
import { lote_ProduccionRepository } from '../domain/ports/lotes.produccion.repository.port';
import { descontarStockUseCase } from '../application/use-cases/descontar-lotes-produccion-use-case';
import { reponerStockUseCase } from '../application/use-cases/reponer-lotes-produccion-use-case';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
    imports: [
        IamModule,
        TypeOrmModule.forFeature([LoteProduccionOrmEntity])],
    controllers: [loteProduccionController],
    providers: [
        reponerStockUseCase,
        CrearLoteProduccionUseCase,
        ActualizarLoteProduccionUseCase,
        listarLotesProduccionUseCase,
        descontarStockUseCase,
        {
            provide: lote_ProduccionRepository,
            useClass: LoteProduccionRepositoryImpl,
        },
    ],
    exports: [lote_ProduccionRepository, descontarStockUseCase, reponerStockUseCase]
})
export class LotesProduccionModule {}
