import { Inject, Injectable } from '@nestjs/common';
import type { IotGlobalConfigRepositoryPort } from '../../../domain/ports/iot-global-config.repository.port';
import { IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN } from '../../../domain/ports/iot-global-config.repository.token';
import { ObtenerIotGlobalConfigUseCase } from './obtener-iot-global-config.use-case';

@Injectable()
export class EliminarIotGlobalConfigUseCase {
  constructor(
    @Inject(IOT_GLOBAL_CONFIG_REPOSITORY_TOKEN)
    private readonly configRepository: IotGlobalConfigRepositoryPort,
    private readonly obtenerIotGlobalConfigUseCase: ObtenerIotGlobalConfigUseCase,
  ) {}

  async execute(id: number): Promise<void> {
    await this.obtenerIotGlobalConfigUseCase.execute(id);
    await this.configRepository.eliminar(id);
  }
}