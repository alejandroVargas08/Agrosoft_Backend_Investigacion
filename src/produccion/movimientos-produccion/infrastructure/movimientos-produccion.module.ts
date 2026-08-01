import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { movimientoProduccionRepositoryImpl } from './persistence/movimiento-produccion.repository.impl';
import { movimientoProduccionOrmEntity } from './persistence/movimiento-produccion.orm-entity';
import { movimientoProduccionController } from './http/movimiento-produccion.controller';
import { registrarMovimientoProduccionUseCase } from '../application/use-cases/registrar-movimiento-produccion.use-case';
import { listarMovimientoProduccionUseCase } from '../application/use-cases/listar-movimiento-produccion.use-case';
import { movimiento_ProduccionRepository } from '../domain/ports/movimiento-produccion.repository.port';

@Module({
    imports: [TypeOrmModule.forFeature([movimientoProduccionOrmEntity])],
    controllers: [movimientoProduccionController],
    providers: [
        registrarMovimientoProduccionUseCase,
        listarMovimientoProduccionUseCase,
        { provide: movimiento_ProduccionRepository, useClass: movimientoProduccionRepositoryImpl },
    ],
    exports: [movimiento_ProduccionRepository]
})
export class MovimientosProduccionModule {}
