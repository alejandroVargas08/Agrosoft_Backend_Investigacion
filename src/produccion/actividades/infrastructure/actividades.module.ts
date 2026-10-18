import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { TerritorioModule } from '../../../modules/territorio/territorio.module';
import { CultivosModule } from '../../cultivos/infrastructure/cultivos.module';
import { actividadesOrmEntity } from './persistence/actividades.orm-entity';
import { ActividadesController } from './http/actividades.controller';
import { actividades_repository } from '../domain/ports/actividades.repository.port';
import { actividadesRepositoryImpl } from './persistence/actividades.repository.impl';
import { AccesoActividadesService } from '../aplicattion/services/acceso-actividades.service';
import { ActividadVisibleGuard } from './http/actividad-visible.guard';
import { crearActividadesUseCase } from '../aplicattion/use-cases/crear-actividades.use-case';
import { listarActividadesUseCase } from '../aplicattion/use-cases/listar-actividades.use-case';
import { actualizarActividadesUseCase } from '../aplicattion/use-cases/actualizar-actividades.use-case';
import { cambiarActividadesUseCase } from '../aplicattion/use-cases/cambiar-actividades.use-case';
import { eliminarActividadesUseCase } from '../aplicattion/use-cases/eliminar-actividades.use-case';

@Module({
    imports: [
        IamModule,
        TerritorioModule,
        CultivosModule,
        TypeOrmModule.forFeature([actividadesOrmEntity]),
    ],
    controllers: [ActividadesController],
    providers: [
        { provide: actividades_repository, useClass: actividadesRepositoryImpl },
        AccesoActividadesService,
        ActividadVisibleGuard,
        crearActividadesUseCase,
        listarActividadesUseCase,
        actualizarActividadesUseCase,
        cambiarActividadesUseCase,
        eliminarActividadesUseCase,
    ],
    exports: [actividades_repository, AccesoActividadesService, ActividadVisibleGuard],
})
export class ActividadesModule {}
