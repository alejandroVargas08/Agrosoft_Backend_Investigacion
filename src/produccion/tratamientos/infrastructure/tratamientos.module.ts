import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../../modules/iam/iam.module';
import { IncidenciasModule } from '../../incidencias/infrastructure/incidencias.module';
import { TratamientoOrmEntity } from './persistence/tratamiento.orm-entity';
import { TratamientoRepositoryImpl } from './persistence/tratamiento.repository.impl';
import { TratamientoController } from './http/tratamiento.controller';
import { Tratamiento_Repository } from '../domain/ports/tratamiento.repository.port';
import { AccesoTratamientosService } from '../application/services/acceso-tratamientos.service';
import { CrearTratamientoUseCase } from '../application/use-cases/crear.tratamiento.use-case';
import { ListarTratamientosUseCase } from '../application/use-cases/listar.tratamientos.use-case';
import { CambiarEstadoTratamientoUseCase } from '../application/use-cases/cambiar-estado.tratamiento.use-case';
import { EliminarTratamientoUseCase } from '../application/use-cases/eliminar.tratamiento.use-case';

@Module({
    imports: [IamModule, IncidenciasModule, TypeOrmModule.forFeature([TratamientoOrmEntity])],
    controllers: [TratamientoController],
    providers: [
        { provide: Tratamiento_Repository, useClass: TratamientoRepositoryImpl },
        AccesoTratamientosService,
        CrearTratamientoUseCase,
        ListarTratamientosUseCase,
        CambiarEstadoTratamientoUseCase,
        EliminarTratamientoUseCase,
    ],
    // CrearTratamientoUseCase se exporta para que el bot de Telegram pueda llamarlo
    exports: [Tratamiento_Repository, ListarTratamientosUseCase, CrearTratamientoUseCase],
})
export class TratamientosModule {}
