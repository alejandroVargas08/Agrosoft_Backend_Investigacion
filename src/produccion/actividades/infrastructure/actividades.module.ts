import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadesOrmEntity } from './persistence/actividades.Orm-entity';
import { ActividadesController } from './http/actividades.controller';
import { actividades_repository } from '../domain/ports/actividades.repository.port';
import { actividadesRepositoryImpl } from './persistence/actividades.repository.impl';
import { crearActividadesUseCase } from '../aplicattion/use-cases/crear-actividades.use-case';
import { listarActividadesUseCase } from '../aplicattion/use-cases/listar-actividades.use-case';
import { actualizarActividadesUseCase } from '../aplicattion/use-cases/actualizar-actividades.use-case';
import { cambiarActividadesUseCase } from '../aplicattion/use-cases/cambiar-actividades.use-case';
import { eliminarActividadesUseCase } from '../aplicattion/use-cases/eliminar-actividades.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadesOrmEntity]),
    ],
    controllers: [ActividadesController],
    providers: [
        {
            provide: actividades_repository,
            useClass: actividadesRepositoryImpl,
        },

        crearActividadesUseCase,
        listarActividadesUseCase,
        actualizarActividadesUseCase,
        cambiarActividadesUseCase,
        eliminarActividadesUseCase,
    ],
})
export class ActividadesModule {}
