import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { TerritorioModule } from '../../../modules/territorio/territorio.module';
import { NotificacionesModule } from '../../../modules/notificaciones/notificaciones.module';
import { CultivosModule } from '../../cultivos/infrastructure/cultivos.module';
import { actividadesOrmEntity } from './persistence/actividades.orm-entity';
import { ActividadAsignacionOrmEntity } from './persistence/actividad-asignacion.orm-entity';
import { ActividadesController } from './http/actividades.controller';
import { ActividadAsignacionesController, MisTareasController, RevisionAsignacionesController } from './http/asignaciones.controller';
import { actividades_repository } from '../domain/ports/actividades.repository.port';
import { ACTIVIDAD_ASIGNACIONES_REPOSITORY } from '../domain/ports/actividad-asignaciones.repository.port';
import { actividadesRepositoryImpl } from './persistence/actividades.repository.impl';
import { ActividadAsignacionesRepositoryImpl } from './persistence/actividad-asignaciones.repository.impl';
import { AccesoActividadesService } from '../aplicattion/services/acceso-actividades.service';
import { NotificadorAsignacionesService } from '../aplicattion/services/notificador-asignaciones.service';
import { PresentadorAsignacionesService } from '../aplicattion/services/presentador-asignaciones.service';
import { ActividadVisibleGuard } from './http/actividad-visible.guard';
import { crearActividadesUseCase } from '../aplicattion/use-cases/crear-actividades.use-case';
import { listarActividadesUseCase } from '../aplicattion/use-cases/listar-actividades.use-case';
import { actualizarActividadesUseCase } from '../aplicattion/use-cases/actualizar-actividades.use-case';
import { cambiarActividadesUseCase } from '../aplicattion/use-cases/cambiar-actividades.use-case';
import { eliminarActividadesUseCase } from '../aplicattion/use-cases/eliminar-actividades.use-case';
import { GestionarAsignacionesUseCase } from '../aplicattion/use-cases/asignaciones/gestionar-asignaciones.use-case';
import { MisTareasUseCase } from '../aplicattion/use-cases/asignaciones/mis-tareas.use-case';
import { RevisarAsignacionesUseCase } from '../aplicattion/use-cases/asignaciones/revisar-asignaciones.use-case';

@Module({
    imports: [
        IamModule,
        TerritorioModule,
        NotificacionesModule,
        CultivosModule,
        TypeOrmModule.forFeature([actividadesOrmEntity, ActividadAsignacionOrmEntity]),
    ],
    controllers: [
        ActividadesController,
        ActividadAsignacionesController,
        MisTareasController,
        RevisionAsignacionesController,
    ],
    providers: [
        { provide: actividades_repository, useClass: actividadesRepositoryImpl },
        { provide: ACTIVIDAD_ASIGNACIONES_REPOSITORY, useClass: ActividadAsignacionesRepositoryImpl },
        AccesoActividadesService,
        NotificadorAsignacionesService,
        PresentadorAsignacionesService,
        ActividadVisibleGuard,
        crearActividadesUseCase,
        listarActividadesUseCase,
        actualizarActividadesUseCase,
        cambiarActividadesUseCase,
        eliminarActividadesUseCase,
        GestionarAsignacionesUseCase,
        MisTareasUseCase,
        RevisarAsignacionesUseCase,
    ],
    exports: [actividades_repository, ACTIVIDAD_ASIGNACIONES_REPOSITORY, AccesoActividadesService, ActividadVisibleGuard],
})
export class ActividadesModule {}
