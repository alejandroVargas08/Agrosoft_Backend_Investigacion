import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadHerramientaOrmEntity } from './persistence/actividad-herramienta.orm-entity';
import { actividadHerramientaController } from './http/actividad-herramienta.controller';
import { asignarActividadHerramientaUseCase } from '../application/use-cases/asignar-actividad-herramienta.use-case';
import { listarActividadHerramientaUseCase } from '../application/use-cases/listar-actividad-herramienta.use-case';
import { reEstimarActividadHerramientaUseCase } from '../application/use-cases/reestimar-actividad-herramienta.use.case';
import { quitarActividadHerramientaUseCase } from '../application/use-cases/quitar-actividad-herramienra.use-case';
import { actividad_HerramientasRepository } from '../domain/ports/actividad-herramientas.repository.port';
import { actividadHerramientaRepositoryImpl } from './persistence/actividad-herramienta.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadHerramientaOrmEntity])
    ],
    controllers: [actividadHerramientaController],
    providers: [
        asignarActividadHerramientaUseCase,
        listarActividadHerramientaUseCase,
        reEstimarActividadHerramientaUseCase,
        quitarActividadHerramientaUseCase,

        {provide: actividad_HerramientasRepository, useClass: actividadHerramientaRepositoryImpl},
    ],
    exports: [actividad_HerramientasRepository],
})
export class ActividadHerramientasModule {}
