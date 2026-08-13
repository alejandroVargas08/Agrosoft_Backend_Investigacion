import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from '../../../domain/ports/iot-global-config.repository.token';

@Injectable()
export class ObtenerIotGlobalConfigUseCase {
  constructor(
    @Inject(IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IotGlobalConfigRepositoryPort,
  ) {}

  async execute(id: number): Promise<IotGlobalConfig> {
    const config = await this.configRepository.buscarPorId(id);
    if (!config) throw new NotFoundException(`No existe una configuración con id ${id}`);
    return config;
  }
}