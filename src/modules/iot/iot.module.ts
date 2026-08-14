import { MqttSensorListener } from './infraestructure/mqtt/mqtt-sensor.listener';

import { IotGlobalConfigController } from './infraestructure/http/controllers/iot-global-config.controller';
import { IotGlobalConfigOrmEntity } from './infraestructure/persistence/entities/iot-global-config.orm-entity';
import { IotGlobalConfigRepository } from './infraestructure/persistence/repositories/iot-global-config.repository';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from './domain/ports/iot-global-config.repository.token';

import { CrearIotGlobalConfigUseCase } from './application/use-cases/iot-global-config/crear-iot-global-config.use-case';
import { ObtenerIotGlobalConfigUseCase } from './application/use-cases/iot-global-config/obtener-iot-global-config.use-case';
import { ListarIotGlobalConfigUseCase } from './application/use-cases/iot-global-config/listar-iot-global-config.use-case';
import { ActualizarIotGlobalConfigUseCase } from './application/use-cases/iot-global-config/actualizar-iot-global-config.use-case';
import { EliminarIotGlobalConfigUseCase } from './application/use-cases/iot-global-config/eliminar-iot-global-config.use-case';

import { SensorAlertasController } from './infraestructure/http/controllers/sensor-alertas.controller';
import { SensorAlertaOrmEntity } from './infraestructure/persistence/entities/sensor-alerta.orm-entity';
import { SensorAlertaRepository } from './infraestructure/persistence/repositories/sensor-alerta.repository';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from './domain/ports/sensor-alerta.repository.token';

import { CrearSensorAlertaUseCase } from './application/use-cases/sensor-alertas/crear-sensor-alerta.use-case';
import { ObtenerSensorAlertaUseCase } from './application/use-cases/sensor-alertas/obtener-sensor-alerta.use-case';
import { ListarSensorAlertasUseCase } from './application/use-cases/sensor-alertas/listar-sensor-alertas.use-case';
import { ListarAlertasPorSensorUseCase } from './application/use-cases/sensor-alertas/listar-alertas-por-sensor.use-case';
import { EliminarSensorAlertaUseCase } from './application/use-cases/sensor-alertas/eliminar-sensor-alerta.use-case';

import { SensorLecturasController } from './infraestructure/http/controllers/sensor-lecturas.controller';
import { SensorLecturaOrmEntity } from './infraestructure/persistence/entities/sensor-lectura.orm-entity';
import { SensorLecturaRepository } from './infraestructure/persistence/repositories/sensor-lectura.repository';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from './domain/ports/sensor-lectura.repository.token';

import { CrearSensorLecturaUseCase } from './application/use-cases/sensor-lecturas/crear-sensor-lectura.use-case';
import { ObtenerSensorLecturaUseCase } from './application/use-cases/sensor-lecturas/obtener-sensor-lectura.use-case';
import { ListarSensorLecturasUseCase } from './application/use-cases/sensor-lecturas/listar-sensor-lecturas.use-case';
import { ListarLecturasPorSensorUseCase } from './application/use-cases/sensor-lecturas/listar-lecturas-por-sensor.use-case';
import { EliminarSensorLecturaUseCase } from './application/use-cases/sensor-lecturas/eliminar-sensor-lectura.use-case';

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
  imports: [TypeOrmModule.forFeature([SensorOrmEntity,
      TipoSensorOrmEntity,
      SensorLecturaOrmEntity,
      SensorAlertaOrmEntity,
      IotGlobalConfigOrmEntity,])],
 controllers: [SensoresController,
    TiposSensoresController,
    SensorLecturasController,
    SensorAlertasController,
    IotGlobalConfigController,],
  providers: [
    CrearSensorUseCase,
    ObtenerSensorUseCase,
    ListarSensoresUseCase,
    ActualizarSensorUseCase,
    EliminarSensorUseCase,
    MqttSensorListener,
    { provide: SENSOR_REPOSITORY_TOKEN, useClass: SensorRepository },

    CrearTipoSensorUseCase,
    ObtenerTipoSensorUseCase,
    ListarTiposSensoresUseCase,
    ActualizarTipoSensorUseCase,
    EliminarTipoSensorUseCase,
    { provide: TIPO_SENSOR_REPOSITORY_TOKEN, useClass: TipoSensorRepository },

    CrearSensorLecturaUseCase,
    ObtenerSensorLecturaUseCase,
    ListarSensorLecturasUseCase,
    ListarLecturasPorSensorUseCase,
    EliminarSensorLecturaUseCase,
    { provide: SENSOR_LECTURA_REPOSITORY_TOKEN, useClass: SensorLecturaRepository },

    CrearSensorAlertaUseCase,
    ObtenerSensorAlertaUseCase,
    ListarSensorAlertasUseCase,
    ListarAlertasPorSensorUseCase,
    EliminarSensorAlertaUseCase,
    { provide: SENSOR_ALERTA_REPOSITORY_TOKEN, useClass: SensorAlertaRepository },

    CrearIotGlobalConfigUseCase,
    ObtenerIotGlobalConfigUseCase,
    ListarIotGlobalConfigUseCase,
    ActualizarIotGlobalConfigUseCase,
    EliminarIotGlobalConfigUseCase,
    { provide: IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN, useClass: IotGlobalConfigRepository },
  ],
  exports: [SENSOR_REPOSITORY_TOKEN,
    TIPO_SENSOR_REPOSITORY_TOKEN,
    SENSOR_LECTURA_REPOSITORY_TOKEN,
    SENSOR_ALERTA_REPOSITORY_TOKEN,
    IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN,],
})
export class IotModule {}