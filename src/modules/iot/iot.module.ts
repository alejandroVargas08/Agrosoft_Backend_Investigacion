import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SensoresController } from './infraestructure/http/controllers/sensores.controller';
import { TiposSensoresController } from './infraestructure/http/controllers/tipos-sensores.controller';

import { SensorOrmEntity } from './infraestructure/persistence/entities/sensor.orm-entity';
import { TipoSensorOrmEntity } from './infraestructure/persistence/entities/tipo-sensor.orm-entity';

import { SensorRepository } from './infraestructure/persistence/repositories/sensor.repository';
import { TipoSensorRepository } from './infraestructure/persistence/repositories/tipo-sensor.repository';

import { SENSOR_REPOSITORY_TOKEN } from './domain/ports/sensor.repository.token';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from './domain/ports/tipo-sensor.repository.token';

import { CrearSensorUseCase } from './application/use-cases/sensores/crear-sensor.use-case';
import { ObtenerSensorUseCase } from './application/use-cases/sensores/obtener-sensor.use-case';
import { ListarSensoresUseCase } from './application/use-cases/sensores/listar-sensores.use-case';
import { ActualizarSensorUseCase } from './application/use-cases/sensores/actualizar-sensor.use-case';
import { EliminarSensorUseCase } from './application/use-cases/sensores/eliminar-sensor.use-case';

import { CrearTipoSensorUseCase } from './application/use-cases/tipos-sensores/crear-tipo-sensor.use-case';
import { ObtenerTipoSensorUseCase } from './application/use-cases/tipos-sensores/obtener-tipo-sensor.use-case';
import { ListarTiposSensoresUseCase } from './application/use-cases/tipos-sensores/listar-tipos-sensores.use-case';
import { ActualizarTipoSensorUseCase } from './application/use-cases/tipos-sensores/actualizar-tipo-sensor.use-case';
import { EliminarTipoSensorUseCase } from './application/use-cases/tipos-sensores/eliminar-tipo-sensor.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([SensorOrmEntity, TipoSensorOrmEntity])],
  controllers: [SensoresController, TiposSensoresController],
  providers: [
    CrearSensorUseCase,
    ObtenerSensorUseCase,
    ListarSensoresUseCase,
    ActualizarSensorUseCase,
    EliminarSensorUseCase,
    { provide: SENSOR_REPOSITORY_TOKEN, useClass: SensorRepository },

    CrearTipoSensorUseCase,
    ObtenerTipoSensorUseCase,
    ListarTiposSensoresUseCase,
    ActualizarTipoSensorUseCase,
    EliminarTipoSensorUseCase,
    { provide: TIPO_SENSOR_REPOSITORY_TOKEN, useClass: TipoSensorRepository },
  ],
  exports: [SENSOR_REPOSITORY_TOKEN, TIPO_SENSOR_REPOSITORY_TOKEN],
})
export class IotModule {}