import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadInsumoOrmEntity } from './persistence/actividad-insumo.orm-entity';
import { actividadInsumoController } from './http/actividad-insumo.controller';
import { registrarActividadInsumoUseCase } from '../aplicattion/use-case/registrar-actividad-insumo.use-case';
import { listarActividadInsumosUseCase } from '../aplicattion/use-case/listar-actividad-insumos.use-case';
import { eliminarActividadInsumoUseCase } from '../aplicattion/use-case/eliminar-actividad-insumo.use-case';
import { actividad_InsumoRepository } from '../domain/port/actividad-insumo.repository.port';
import { actividadInsumoRepositoryImpl } from './persistence/actividad-insumo.repository.impl';
import { ActividadesModule } from '../../actividades/infrastructure/actividades.module';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
    imports: [
        IamModule,
        ActividadesModule,
        TypeOrmModule.forFeature([actividadInsumoOrmEntity]),
    ],
    controllers: [actividadInsumoController],
    providers: [
        registrarActividadInsumoUseCase,
        listarActividadInsumosUseCase,
        eliminarActividadInsumoUseCase,
        { provide: actividad_InsumoRepository, useClass: actividadInsumoRepositoryImpl },
    ],
    exports: [actividad_InsumoRepository],
})
export class ActividadInsumosModule {}
