import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadHistorialOrmEntity } from './persistence/actividad-historial.orm-entity';
import { actividadHistorialController } from './http/actividad-historial.controller';
import { actividad_HistorialRepository } from '../domain/ports/actividad-historial.repository.port';
import { actividadHistorialRepositoryImpl } from './persistence/actividad-historial.repository.impl';
import { registrarActividadHistorialUseCase } from '../aplicattion/use-cases/registrar-actividad-historial.use-case';
import { listarActividadHistorialUseCase } from '../aplicattion/use-cases/listar-actividad.historial.use-case';
import { ListarHistorialVisibleUseCase } from '../aplicattion/use-cases/listar-historial-visible.use-case';
import { ActividadesModule } from '../../actividades/infrastructure/actividades.module';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
    imports: [
        IamModule,
        ActividadesModule,
        TypeOrmModule.forFeature([
        actividadHistorialOrmEntity
    ])],
    controllers: [actividadHistorialController],
    providers: [
        {
            provide: actividad_HistorialRepository,
            useClass: actividadHistorialRepositoryImpl,
        },

        registrarActividadHistorialUseCase,
        listarActividadHistorialUseCase,
        ListarHistorialVisibleUseCase,
    ],

    exports: [registrarActividadHistorialUseCase],
})
export class ActividadHistorialModule {}
