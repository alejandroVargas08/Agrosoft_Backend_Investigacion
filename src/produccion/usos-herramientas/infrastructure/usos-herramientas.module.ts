import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { usoHerramientaOrmEntity } from './persistence/uso-herramienta.orm-entity';
import { usoHerramientaController } from './controller/uso-herramienta.controller';
import { registrarUsoHerramientaUseCase } from '../application/use-cases/registrar-uso-herramienta.use-case';
import { listarUsoHerramientasUseCase } from '../application/use-cases/listar-uso-herramienta.use-case';
import { uso_HerramientaRepository } from '../domain/ports/uso-herramienta.repository.port';
import { usoHerramientaRepositoryImpl } from './persistence/uso-herramienta.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([usoHerramientaOrmEntity])
    ],
    controllers: [usoHerramientaController],
    providers: [
        registrarUsoHerramientaUseCase,
        listarUsoHerramientasUseCase,
        {provide: uso_HerramientaRepository, useClass: usoHerramientaRepositoryImpl},
    ],

    exports: [uso_HerramientaRepository],

})
export class UsosHerramientasModule {}
