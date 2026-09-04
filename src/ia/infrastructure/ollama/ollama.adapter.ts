import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IaProviderPort } from '../../domain/ports/ia-provider.port';

@Injectable()
export class OllamaAdapter implements IaProviderPort {
  private readonly url = 'http://localhost:11434/api/chat';

  async chat(mensaje: string, contexto?: string): Promise<string> {
    const { data } = await axios.post(
      this.url,
      {
        model: 'qwen3.5:9b',
        messages: [
          { role: 'system', content: contexto ?? 'Eres el asistente agrícola de AgroSoft.' },
          { role: 'user', content: mensaje },
        ],
        stream: false,
        think: false,
      },
      { timeout: 120000 },
    );

    return data?.message?.content ?? '';
  }

  //Esta la sesion para analizar la imagen
  async analizarImagen(base64Image: string, prompt: string): Promise<string> {
    const { data } = await axios.post(
      this.url,
      {
        model: 'qwen3.5:9b',
        messages: [
          { role: 'user', content: prompt, images: [base64Image] },
        ],
        stream: false,
        think: false,
      },
      { timeout: 120000 },
    );

    return data?.message?.content ?? '';
  }
}