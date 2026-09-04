export type Protocolo = 'HTTP' | 'MQTT';

export class ConfiguracionConexion {
  private constructor(
    public readonly protocolo: Protocolo,
    public readonly endpointUrl: string | null,
    public readonly mqttTopic: string | null,
  ) {}

  static crear(protocolo: Protocolo, endpointUrl: string | null, mqttTopic: string | null): ConfiguracionConexion {
    if (protocolo === 'MQTT' && !mqttTopic) {
      throw new Error('Un sensor con protocolo MQTT necesita un mqttTopic');
    }
    if (protocolo === 'HTTP' && !endpointUrl) {
      throw new Error('Un sensor con protocolo HTTP necesita un endpointUrl');
    }
    return new ConfiguracionConexion(protocolo, endpointUrl, mqttTopic);
  }
}