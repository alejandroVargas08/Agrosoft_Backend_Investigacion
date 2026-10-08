import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidenciaOrmEntity } from './persistence/incidencia.orm-entity';
import { IncidenciaRepositoryImpl } from './persistence/incidencia.repository.impl';
import { IncidenciaController } from './http/incidencia.controller';
import { Incidencia_Repository } from '../domain/ports/incidencia.repository.port';
import { CrearIncidenciaUseCase } from '../application/use-cases/crear.incidencia.use-case';
import { ListarIncidenciasUseCase } from '../application/use-cases/listar.incidencias.use-case';
import { CambiarEstadoIncidenciaUseCase } from '../application/use-cases/cambiar-estado.incidencia.use-case';
import { EliminarIncidenciaUseCase } from '../application/use-cases/eliminar.incidencia.use-case';

@Module({
    imports: [TypeOrmModule.forFeature([IncidenciaOrmEntity])],
    controllers: [IncidenciaController],
    providers: [
        CrearIncidenciaUseCase,
        ListarIncidenciasUseCase,
        CambiarEstadoIncidenciaUseCase,
        EliminarIncidenciaUseCase,
        {
            provide: Incidencia_Repository,
            useClass: IncidenciaRepositoryImpl,
        },
    ],
    exports: [Incidencia_Repository, ListarIncidenciasUseCase],
})
export class IncidenciasModule {}