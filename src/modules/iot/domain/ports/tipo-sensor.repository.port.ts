import { TipoSensor } from '../entities/tipo-sensor.entity';

export interface TipoSensorRepositoryPort {
  guardar(tipoSensor: TipoSensor): Promise<TipoSensor>;
  actualizar(id: number, tipoSensor: TipoSensor): Promise<TipoSensor>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<TipoSensor | null>;
  listarTodos(): Promise<TipoSensor[]>;
}