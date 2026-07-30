import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadInsumoOrmEntity } from './persistence/actividad-insumo.orm-entity';
import { actividadInsumoController } from './http/actividad-insumo.controller';
import { registrarActividadInsumoUseCase } from '../aplicattion/use-case/registrar-actividad-insumo.use-case';
import { listarActividadInsumosUseCase } from '../aplicattion/use-case/listar-actividad-insumos.use-case';
import { eliminarActividadesUseCase } from '../../actividades/aplicattion/use-cases/eliminar-actividades.use-case';
import { actividad_InsumoRepository } from '../domain/port/actividad-insumo.repository.port';
import { actividadInsumoRepositoryImpl } from './persistence/actividad-insumo.repository.impl';
import { ActividadesModule } from '../../actividades/infrastructure/actividades.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadInsumoOrmEntity]),
        ActividadesModule,
    ],
    controllers: [actividadInsumoController],
    providers: [
        registrarActividadInsumoUseCase,
        listarActividadInsumosUseCase,
        eliminarActividadesUseCase,
        { provide: actividad_InsumoRepository, useClass: actividadInsumoRepositoryImpl },
    ],
    exports: [actividad_InsumoRepository],
})
export class ActividadInsumosModule {}
