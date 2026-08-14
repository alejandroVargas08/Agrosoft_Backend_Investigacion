import { SensorLectura } from '../entities/sensor-lectura.entity';

export interface SensorLecturaRepositoryPort {
  guardar(lectura: SensorLectura): Promise<SensorLectura>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<SensorLectura | null>;
  listarTodos(): Promise<SensorLectura[]>;
  listarPorSensorId(sensorId: number): Promise<SensorLectura[]>;
}