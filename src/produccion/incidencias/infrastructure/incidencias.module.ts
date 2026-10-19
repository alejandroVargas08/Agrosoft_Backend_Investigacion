import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { CultivosModule } from '../../cultivos/infrastructure/cultivos.module';
import { IncidenciaOrmEntity } from './persistence/incidencia.orm-entity';
import { IncidenciaRepositoryImpl } from './persistence/incidencia.repository.impl';
import { IncidenciaController } from './http/incidencia.controller';
import { Incidencia_Repository } from '../domain/ports/incidencia.repository.port';
import { AccesoIncidenciasService } from '../application/services/acceso-incidencias.service';
import { CrearIncidenciaUseCase } from '../application/use-cases/crear.incidencia.use-case';
import { ListarIncidenciasUseCase } from '../application/use-cases/listar.incidencias.use-case';
import { CambiarEstadoIncidenciaUseCase } from '../application/use-cases/cambiar-estado.incidencia.use-case';
import { EliminarIncidenciaUseCase } from '../application/use-cases/eliminar.incidencia.use-case';

@Module({
    imports: [IamModule, CultivosModule, TypeOrmModule.forFeature([IncidenciaOrmEntity])],
    controllers: [IncidenciaController],
    providers: [
        { provide: Incidencia_Repository, useClass: IncidenciaRepositoryImpl },
        AccesoIncidenciasService,
        CrearIncidenciaUseCase,
        ListarIncidenciasUseCase,
        CambiarEstadoIncidenciaUseCase,
        EliminarIncidenciaUseCase,
    ],
    exports: [
        Incidencia_Repository,
        AccesoIncidenciasService,
        ListarIncidenciasUseCase,
        CrearIncidenciaUseCase,
        ],
})
export class IncidenciasModule {}
