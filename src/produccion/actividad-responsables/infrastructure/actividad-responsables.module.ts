import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadResponsableOrmEntity } from './persistence/actividad-responsables.orm-entity';
import { actividadResponsableController } from './http/actividad-responsable.controller';
import { registrarActividadResponsableUseCase } from '../application/use-cases/registrar-actividad-responsables.use-case';
import { listarActividadResponsablesUseCase } from '../application/use-cases/listar-actividad-responsables.use-case';
import { actualizarActividadResponsablesUseCase } from '../application/use-cases/actualizar-actividad-resposables.use-case';
import { eliminarActividadResponsablesUseCase } from '../application/use-cases/eliminar-actividad-responsables.use-case';
import { actividad_ResponsableRepository } from '../domain/ports/actividad-responsable.port';
import { actividadResponsablesRepositoryImpl } from './persistence/actividad-responsable.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadResponsableOrmEntity])
    ],
    controllers: [actividadResponsableController],
    providers: [
        registrarActividadResponsableUseCase,
        listarActividadResponsablesUseCase,
        actualizarActividadResponsablesUseCase,
        eliminarActividadResponsablesUseCase,
        { provide: actividad_ResponsableRepository, useClass: actividadResponsablesRepositoryImpl},
    ],

    exports: [actividad_ResponsableRepository]
})
export class ActividadResponsablesModule {}
