import { IotGlobalConfig } from '../entities/iot-global-config.entity';

export interface IotGlobalConfigRepositoryPort {
  guardar(config: IotGlobalConfig): Promise<IotGlobalConfig>;
  actualizar(id: number, config: IotGlobalConfig): Promise<IotGlobalConfig>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<IotGlobalConfig | null>;
  listarTodos(): Promise<IotGlobalConfig[]>;
}