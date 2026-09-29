import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IaProviderPort, MensajeHistorial } from '../../domain/ports/ia-provider.port';

@Injectable()
export class OllamaAdapter implements IaProviderPort {
  private readonly url: string;
  private readonly modelo: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('OLLAMA_URL');
    const modelo = this.configService.get<string>('OLLAMA_MODEL');

    if (!url || !modelo) {
      throw new Error(
        'Faltan variables de entorno OLLAMA_URL y/o OLLAMA_MODEL. Revisa tu archivo .env.',
      );
    }

    this.url = url;
    this.modelo = modelo;
  }

  async chat(historial: MensajeHistorial[]): Promise<string> {
    const { data } = await axios.post(
      this.url,
      { model: this.modelo, messages: historial, stream: false, think: false },
      { timeout: 120000 },
    );
    return data?.message?.content ?? '';
  }

  async analizarImagenes(base64Images: string[], prompt: string): Promise<string> {
    const { data } = await axios.post(
      this.url,
      {
        model: this.modelo,
        messages: [{ role: 'user', content: prompt, images: base64Images }],
        stream: false,
        think: false,
      },
      { timeout: 180000 },
    );
    return data?.message?.content ?? '';
  }
}