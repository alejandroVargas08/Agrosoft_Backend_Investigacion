import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivoOrmEntity } from './persistence/cultivo.orm-entity';
import { CultivoController } from './http/cultivo.controller';
import { CrearCultivoUseCase } from '../application/use-cases/crear.cultivo.use-case';
import { listarCultivoUseCase } from '../application/use-cases/listar.cultivos.use-case';
import { CultivoRepositoryImpl } from './persistence/cultivo.repository.impl';
import { Cultivo_Repository } from '../domain/ports/cultivo.repository.port';

@Module({
    imports: [TypeOrmModule.forFeature([CultivoOrmEntity])],
    controllers: [CultivoController],
    providers: [
        CrearCultivoUseCase,
        listarCultivoUseCase,
        {
            provide: Cultivo_Repository,
            useClass: CultivoRepositoryImpl,
        },
    ],
    exports: [Cultivo_Repository],
})
export class CultivosModule {}
