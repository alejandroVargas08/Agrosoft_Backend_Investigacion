export interface MensajeHistorial {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IaProviderPort {
  chat(historial: MensajeHistorial[]): Promise<string>;
  analizarImagenes(base64Images: string[], prompt: string): Promise<string>;
}