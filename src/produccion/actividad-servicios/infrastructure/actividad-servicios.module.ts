import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadServicioOrmEntity } from './persistence/actividad-servicios.orm-entity';
import { actividadServicioController } from './http/actividad-servicios.controller';
import { registrarActividadServicioUseCase } from '../aplicattion/use-cases/registrar-actividad-servicios.use-case';
import { listarActividadServicioUseCase } from '../aplicattion/use-cases/listar-actividad-servicios.use-case';
import { actualizarActividadServicioUseCase } from '../aplicattion/use-cases/actualizar-actividad-servicios.use-case';
import { eliminarActividadServicioUseCase } from '../aplicattion/use-cases/eliminar-actividad-servicios.use-case';
import { actividad_ServicioRepository } from '../domain/ports/actividad-servicios.repository.port';
import { actividadServicioRepositoryImpl } from './persistence/actividad-servicios.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadServicioOrmEntity])],
    controllers: [actividadServicioController],
    providers: [
        registrarActividadServicioUseCase,
        listarActividadServicioUseCase,
        actualizarActividadServicioUseCase,
        eliminarActividadServicioUseCase,

        { provide: actividad_ServicioRepository, useClass: actividadServicioRepositoryImpl},
    ],
    exports: [actividad_ServicioRepository],
})
export class ActividadServiciosModule {}
