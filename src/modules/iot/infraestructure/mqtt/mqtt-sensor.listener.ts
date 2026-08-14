import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { CrearSensorLecturaUseCase } from '../../application/use-cases/sensor-lecturas/crear-sensor-lectura.use-case';
import { ListarSensoresUseCase } from '../../application/use-cases/sensores/listar-sensores.use-case';

@Injectable()
export class MqttSensorListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttSensorListener.name);
  private client: mqtt.MqttClient | null = null;

  constructor(
    private readonly crearSensorLecturaUseCase: CrearSensorLecturaUseCase,
    private readonly listarSensoresUseCase: ListarSensoresUseCase,
  ) {}

  async onModuleInit() {
    const brokerUrl = `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`;

    this.client = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });

    this.client.on('connect', async () => {
      this.logger.log('Conectado al broker MQTT');
      await this.suscribirseATodosLosSensores();
    });

    this.client.on('message', (topic, payload) => {
      this.manejarMensaje(topic, payload);
    });

    this.client.on('error', (error) => {
      this.logger.error(`Error de conexión MQTT: ${error.message}`);
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }

  private async suscribirseATodosLosSensores(): Promise<void> {
    const sensores = await this.listarSensoresUseCase.execute();
    const sensoresMqtt = sensores.filter((s) => s.conexion.protocolo === 'MQTT' && s.activo);

    for (const sensor of sensoresMqtt) {
      const topic = sensor.conexion.mqttTopic;
      if (topic) {
        this.client?.subscribe(topic, (err) => {
          if (err) this.logger.error(`Error al suscribirse a ${topic}: ${err.message}`);
          else this.logger.log(`Suscrito a ${topic}`);
        });
      }
    }
  }

  private async manejarMensaje(topic: string, payload: Buffer): Promise<void> {
    try {
      const sensores = await this.listarSensoresUseCase.execute();
      const sensor = sensores.find((s) => s.conexion.mqttTopic === topic);

      if (!sensor || sensor.id === null) {
        this.logger.warn(`Mensaje recibido en un tópico sin sensor asociado: ${topic}`);
        return;
      }

      const valor = payload.toString();

      await this.crearSensorLecturaUseCase.execute({
        sensorId: sensor.id,
        valor,
        fechaLectura: new Date().toISOString(),
        unidad: '',
      });

      this.logger.log(`Lectura registrada para sensor ${sensor.id}: ${valor}`);
    } catch (error) {
      this.logger.error(`Error al procesar mensaje de ${topic}: ${(error as Error).message}`);
    }
  }
}