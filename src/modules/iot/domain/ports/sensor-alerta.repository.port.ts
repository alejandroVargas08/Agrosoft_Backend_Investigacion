import { SensorAlerta } from '../entities/sensor-alerta.entity';

export interface SensorAlertaRepositoryPort {
  guardar(alerta: SensorAlerta): Promise<SensorAlerta>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<SensorAlerta | null>;
  listarTodos(): Promise<SensorAlerta[]>;
  listarPorSensorId(sensorId: number): Promise<SensorAlerta[]>;
}