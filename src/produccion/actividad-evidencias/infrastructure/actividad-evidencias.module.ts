import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadEvidenciaOrmEntity } from './persistence/actividad-evidencia.orm-entity';
import { actividadEvidenciaController } from './http/actividad-evidencia.controller';
import { registrarActividadEvidenciaUseCase } from '../aplicattion/use-cases/registrar-actividad-evidencia.use-case';
import { listarActividadEvidenciaUseCase } from '../aplicattion/use-cases/listar-actividad-evidencia.use-case';
import { AgregarImagenActividadEvidenciaUseCase } from '../aplicattion/use-cases/agregar-actividad-evidencia.use-case';
import { eliminarEvidenciaActividadUseCase } from '../aplicattion/use-cases/eliminar-actividad.evidencia.use-case';
import { actividad_evidenciaRepository } from '../domain/ports/actividad-evidencias.repository.port';
import { actividadEvidenciaRepositoryImpl } from './persistence/actividad-evidencia.repository.impl';
import { ActividadesModule } from '../../actividades/infrastructure/actividades.module';
import { IamModule } from '../../../modules/iam/iam.module';

@Module({
    imports: [
        IamModule,
        ActividadesModule,
        TypeOrmModule.forFeature([
        actividadEvidenciaOrmEntity
    ])],
    controllers: [actividadEvidenciaController],
    providers: [
        registrarActividadEvidenciaUseCase,
        listarActividadEvidenciaUseCase,
        AgregarImagenActividadEvidenciaUseCase,
        eliminarEvidenciaActividadUseCase,
        { provide: actividad_evidenciaRepository, useClass: actividadEvidenciaRepositoryImpl},
    ],
    exports: [actividad_evidenciaRepository]
})
export class ActividadEvidenciasModule {}
