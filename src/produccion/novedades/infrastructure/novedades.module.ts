import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { NOVEDAD_REPOSITORY } from '../domain/ports/novedad.repository.port';
import { NovedadesUseCase } from '../application/use-cases/novedades.use-case';
import { MisNovedadesController, NovedadesController } from './http/novedades.controller';
import { NovedadOrmEntity } from './persistence/novedad.orm-entity';
import { NovedadRepositoryImpl } from './persistence/novedad.repository.impl';

@Module({
    imports: [IamModule, TypeOrmModule.forFeature([NovedadOrmEntity])],
    controllers: [MisNovedadesController, NovedadesController],
    providers: [
        NovedadesUseCase,
        { provide: NOVEDAD_REPOSITORY, useClass: NovedadRepositoryImpl },
    ],
    exports: [NOVEDAD_REPOSITORY],
})
export class NovedadesModule {}
