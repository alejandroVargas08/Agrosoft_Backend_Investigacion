import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivoOrmEntity } from './persistence/cultivo.orm-entity';
import { CultivoController } from './http/cultivo.controller';
import { CrearCultivoUseCase } from '../application/use-cases/crear.cultivo.use-case';
import { listarCultivoUseCase } from '../application/use-cases/listar.cultivos.use-case';
import { CultivoRepositoryImpl } from './persistence/cultivo.repository.impl';
import { Cultivo_Repository } from '../domain/ports/cultivo.repository.port';
import { ObtenerCultivoUseCase } from '../application/use-cases/obtener.cultivo.use-case';
import { ActualizarCultivoUseCase } from '../application/use-cases/actualizar.cultivo.use.case';
import { finalizarCultivoUseCase } from '../application/use-cases/finalizar.cultivo.use-case';
import { eliminarCultivoUseCase } from '../application/use-cases/eliminar.cultivo.use-case';

@Module({
    imports: [TypeOrmModule.forFeature([CultivoOrmEntity])],
    controllers: [CultivoController],
    providers: [
        CrearCultivoUseCase,
        listarCultivoUseCase,
        ObtenerCultivoUseCase,
        ActualizarCultivoUseCase,
        finalizarCultivoUseCase,
        eliminarCultivoUseCase,
        {
            provide: Cultivo_Repository,
            useClass: CultivoRepositoryImpl,
        },
    ],
    exports: [Cultivo_Repository,
        ObtenerCultivoUseCase,
        ActualizarCultivoUseCase,
        finalizarCultivoUseCase,
        eliminarCultivoUseCase,
    ],
})
export class CultivosModule {}
