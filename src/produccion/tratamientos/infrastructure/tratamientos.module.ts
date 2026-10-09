import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TratamientoOrmEntity } from './persistence/tratamiento.orm-entity';
import { TratamientoRepositoryImpl } from './persistence/tratamiento.repository.impl';
import { TratamientoController } from './http/tratamiento.controller';
import { Tratamiento_Repository } from '../domain/ports/tratamiento.repository.port';
import { CrearTratamientoUseCase } from '../application/use-cases/crear.tratamiento.use-case';
import { ListarTratamientosUseCase } from '../application/use-cases/listar.tratamientos.use-case';
import { CambiarEstadoTratamientoUseCase } from '../application/use-cases/cambiar-estado.tratamiento.use-case';
import { EliminarTratamientoUseCase } from '../application/use-cases/eliminar.tratamiento.use-case';

@Module({
    imports: [TypeOrmModule.forFeature([TratamientoOrmEntity])],
    controllers: [TratamientoController],
    providers: [
        CrearTratamientoUseCase,
        ListarTratamientosUseCase,
        CambiarEstadoTratamientoUseCase,
        EliminarTratamientoUseCase,
        {
            provide: Tratamiento_Repository,
            useClass: TratamientoRepositoryImpl,
        },
    ],
    exports: [Tratamiento_Repository, ListarTratamientosUseCase],
})
export class TratamientosModule {}