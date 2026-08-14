export class ConexionAgente {
  private constructor(
    public readonly agente: string,
    public readonly puerto: number,
    public readonly protocolo: string,
  ) {}

  static crear(agente: string, puerto: number, protocolo: string): ConexionAgente {
    if (puerto < 1 || puerto > 65535) {
      throw new Error('El puerto debe estar entre 1 y 65535');
    }
    if (!agente || agente.trim().length === 0) {
      throw new Error('El agente (host del broker) no puede estar vacío');
    }
    return new ConexionAgente(agente, puerto, protocolo);
  }
}