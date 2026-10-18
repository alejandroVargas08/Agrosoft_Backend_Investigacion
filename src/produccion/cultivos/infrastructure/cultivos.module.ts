import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { TerritorioModule } from '../../../modules/territorio/territorio.module';
import { CultivoOrmEntity } from './persistence/cultivo.orm-entity';
import { CultivoController } from './http/cultivo.controller';
import { CultivoRepositoryImpl } from './persistence/cultivo.repository.impl';
import { Cultivo_Repository } from '../domain/ports/cultivo.repository.port';
import { AccesoCultivosService } from '../application/services/acceso-cultivos.service';
import { CrearCultivoUseCase } from '../application/use-cases/crear.cultivo.use-case';
import { listarCultivoUseCase } from '../application/use-cases/listar.cultivos.use-case';
import { ObtenerCultivoUseCase } from '../application/use-cases/obtener.cultivo.use-case';
import { ActualizarCultivoUseCase } from '../application/use-cases/actualizar.cultivo.use.case';
import { finalizarCultivoUseCase } from '../application/use-cases/finalizar.cultivo.use-case';
import { eliminarCultivoUseCase } from '../application/use-cases/eliminar.cultivo.use-case';

@Module({
    imports: [IamModule, TerritorioModule, TypeOrmModule.forFeature([CultivoOrmEntity])],
    controllers: [CultivoController],
    providers: [
        { provide: Cultivo_Repository, useClass: CultivoRepositoryImpl },
        AccesoCultivosService,
        CrearCultivoUseCase,
        listarCultivoUseCase,
        ObtenerCultivoUseCase,
        ActualizarCultivoUseCase,
        finalizarCultivoUseCase,
        eliminarCultivoUseCase,
    ],
    exports: [
        Cultivo_Repository,
        AccesoCultivosService,
        ObtenerCultivoUseCase,
        ActualizarCultivoUseCase,
        finalizarCultivoUseCase,
        eliminarCultivoUseCase,
    ],
})
export class CultivosModule {}
