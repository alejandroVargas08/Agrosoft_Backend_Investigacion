import { Sensor } from '../entities/sensor.entity';

export interface SensorRepositoryPort {
  guardar(sensor: Sensor): Promise<Sensor>;
  actualizar(id: number, sensor: Sensor): Promise<Sensor>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Sensor | null>;
  listarTodos(): Promise<Sensor[]>;
}