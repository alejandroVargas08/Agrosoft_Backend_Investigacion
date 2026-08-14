import { Inject, Injectable } from '@nestjs/common';
import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import { ConexionAgente } from '../../../domain/value-objects/conexion-agente.vo';
import { CredencialesAgente } from '../../../domain/value-objects/credenciales-agente.vo';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from '../../../domain/ports/iot-global-config.repository.token';
import { CrearIotGlobalConfigDto } from '../../dto/iot-global-config/crear-iot-global-config.dto';

@Injectable()
export class CrearIotGlobalConfigUseCase {
  constructor(
    @Inject(IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IotGlobalConfigRepositoryPort,
  ) {}

  async execute(dto: CrearIotGlobalConfigDto): Promise<IotGlobalConfig> {
    const config = IotGlobalConfig.crear({
      nombre: dto.nombre,
      conexion: ConexionAgente.crear(dto.agente, dto.puerto, dto.protocolo),
      credenciales: CredencialesAgente.crear(dto.nombreUsuario, dto.contrasena),
      prefijoTema: dto.prefijoTema,
      temasPredeterminados: dto.temasPredeterminados ?? null,
      temasPersonalizados: dto.temasPersonalizados ?? null,
      loteId: dto.loteId ?? null,
      subLoteId: dto.subLoteId ?? null,
      autoDiscover: dto.autoDiscover ?? false,
    });

    return this.configRepository.guardar(config);
  }
}