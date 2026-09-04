import { Inject, Injectable } from '@nestjs/common';
import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import { ConexionAgente } from '../../../domain/value-objects/conexion-agente.vo';
import { CredencialesAgente } from '../../../domain/value-objects/credenciales-agente.vo';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from '../../../domain/ports/iot-global-config.repository.token';
import { ActualizarIotGlobalConfigDto } from '../../dto/iot-global-config/actualizar-iot-global-config.dto';
import { ObtenerIotGlobalConfigUseCase } from './obtener-iot-global-config.use-case';

@Injectable()
export class ActualizarIotGlobalConfigUseCase {
  constructor(
    @Inject(IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IotGlobalConfigRepositoryPort,
    private readonly obtenerIotGlobalConfigUseCase: ObtenerIotGlobalConfigUseCase,
  ) {}

  async execute(id: number, dto: ActualizarIotGlobalConfigDto): Promise<IotGlobalConfig> {
    const actual = await this.obtenerIotGlobalConfigUseCase.execute(id);

    const nuevaConexion = (dto.agente !== undefined || dto.puerto !== undefined || dto.protocolo !== undefined)
      ? ConexionAgente.crear(
          dto.agente ?? actual.conexion.agente,
          dto.puerto ?? actual.conexion.puerto,
          dto.protocolo ?? actual.conexion.protocolo,
        )
      : actual.conexion;

    const nuevasCredenciales = (dto.nombreUsuario !== undefined || dto.contrasena !== undefined)
      ? CredencialesAgente.crear(
          dto.nombreUsuario ?? actual.credenciales.nombreUsuario,
          dto.contrasena ?? actual.credenciales.obtenerContrasenaReal(),
        )
      : actual.credenciales;

    const configActualizada = IotGlobalConfig.desdePersistencia({
      ...actual.toProps(),
      nombre: dto.nombre ?? actual.nombre,
      conexion: nuevaConexion,
      credenciales: nuevasCredenciales,
      prefijoTema: dto.prefijoTema ?? actual.prefijoTema,
      actualizadoEn: new Date(),
    });

    return this.configRepository.actualizar(id, configActualizada);
  }
}