import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteProduccionOrmEntity } from './persistence/lote.produccion.orm-entity';
import { loteProduccionController } from './http/lote.produccion.controller';
import { CrearLoteProduccionUseCase } from '../application/use-cases/crear-lotes-produccion.uses-case';
import { listarLotesProduccionUseCase } from '../application/use-cases/listar.lotes.produccion.use-case';
import { ActualizarLoteProduccionUseCase } from '../application/use-cases/actualizar.lotes.produccion.use-case';
import { LoteProduccionRepositoryImpl } from './persistence/lote.produccion.repository.impl';

@Module({
    imports: [TypeOrmModule.forFeature([LoteProduccionOrmEntity])],
    controllers: [loteProduccionController],
    providers: [
        CrearLoteProduccionUseCase,
        ActualizarLoteProduccionUseCase,
        listarLotesProduccionUseCase,
        {
            provide: 'LoteProduccionRepositoryPort',
            useClass: LoteProduccionRepositoryImpl,
        },
    ],
})
export class LotesProduccionModule {}
