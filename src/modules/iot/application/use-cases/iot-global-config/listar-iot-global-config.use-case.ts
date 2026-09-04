import { Inject, Injectable } from '@nestjs/common';
import { IotGlobalConfig } from '../../../domain/entities/iot-global-config.entity';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from '../../../domain/ports/iot-global-config.repository.token';

@Injectable()
export class ListarIotGlobalConfigUseCase {
  constructor(
    @Inject(IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IotGlobalConfigRepositoryPort,
  ) {}

  async execute(): Promise<IotGlobalConfig[]> {
    return this.configRepository.listarTodos();
  }
}