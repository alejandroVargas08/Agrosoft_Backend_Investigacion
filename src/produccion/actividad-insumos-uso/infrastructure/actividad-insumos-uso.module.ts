import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadInsumoUsoOrmEntity } from './persistence/actividad-insumo-uso.orm-entity';
import { ActividadInsumosReservaModule } from '../../actividad-insumos-reserva/actividad-insumos-reserva.module';
import { actividadInsumoUsoController } from './http/actividad-insumo-uso.controller';
import { listarActividadInsumoUsoUseCase } from '../application/use-cases/listar-actividad-insumo-uso.use-case';
import { registrarInsumoUseCase } from '../application/use-cases/registrar-insumo-uso.use-case';
import { actividad_InsumoUsoRepository } from '../domain/ports/actividad-insumos-uso.repository.port';
import { actividadInsumoUsoRepositoryImpl } from './persistence/actividad-insumo-uso.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadInsumoUsoOrmEntity]),
        ActividadInsumosReservaModule,
    ],
    controllers: [actividadInsumoUsoController],
    providers: [
        registrarInsumoUseCase,
        listarActividadInsumoUsoUseCase,

        {provide: actividad_InsumoUsoRepository, useClass: actividadInsumoUsoRepositoryImpl},
    ],

    exports: [actividad_InsumoUsoRepository],
})
export class ActividadInsumosUsoModule {}
