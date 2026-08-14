import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { historialCultivoOrmEntity } from './infrastructure/persistence/historial-cultivo.orm-entity';
import { historialCultivoController } from './infrastructure/http/historial-cultivo.controller';
import { registrarCambioHistorialCultivoUseCase } from './application/use-cases/registrar-historial-cultivo.use-case';
import { listarHistorialCultivoUseCase } from './application/use-cases/listar-historial-cultivo.use-case';
import { historial_CultivoRepository } from './domain/ports/historial-cultivo.port';
import { historialCultivoRepositoryImpl } from './infrastructure/persistence/historial-cultivo.repository.impl';

@Module({
    imports: [TypeOrmModule.forFeature([historialCultivoOrmEntity])],
    controllers: [historialCultivoController],
    providers: [
        registrarCambioHistorialCultivoUseCase,
        listarHistorialCultivoUseCase,
        { provide: historial_CultivoRepository, useClass: historialCultivoRepositoryImpl },
    ],
    exports: [registrarCambioHistorialCultivoUseCase, historial_CultivoRepository],
})
export class HistorialCultivoModule {}
