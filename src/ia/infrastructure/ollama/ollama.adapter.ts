import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IaProviderPort, MensajeHistorial } from '../../domain/ports/ia-provider.port';

const TIMEOUT_CHAT_MS = 120000;
const TIMEOUT_IMAGENES_MS = 180000;
const TIMEOUT_ESTRUCTURADO_MS = 300000;
const CONTEXTO_ESTRUCTURADO = 8192;

@Injectable()
export class OllamaAdapter implements IaProviderPort {
  private readonly url: string;
  private readonly modelo: string;
  private readonly modeloVision: string;

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
    this.modeloVision = this.configService.get<string>('OLLAMA_VISION_MODEL') || modelo;
  }

  async chat(historial: MensajeHistorial[]): Promise<string> {
    const { data } = await axios.post(
      this.url,
      { model: this.modelo, messages: historial, stream: false, think: false },
      { timeout: TIMEOUT_CHAT_MS },
    );
    return data?.message?.content ?? '';
  }

  async analizarImagenes(base64Images: string[], prompt: string): Promise<string> {
    const { data } = await axios.post(
      this.url,
      {
        model: this.modeloVision,
        messages: [{ role: 'user', content: prompt, images: base64Images }],
        stream: false,
        think: false,
      },
      { timeout: TIMEOUT_IMAGENES_MS },
    );
    return data?.message?.content ?? '';
  }

  async generarEstructurado(
    prompt: string,
    esquema: Record<string, unknown>,
    imagenesBase64: string[] = [],
  ): Promise<unknown> {
    const conImagenes = imagenesBase64.length > 0;
    const mensaje = conImagenes
      ? { role: 'user', content: prompt, images: imagenesBase64 }
      : { role: 'user', content: prompt };

    const { data } = await axios.post(
      this.url,
      {
        model: conImagenes ? this.modeloVision : this.modelo,
        messages: [mensaje],
        stream: false,
        think: false,
        format: esquema,
        options: { temperature: 0, num_ctx: CONTEXTO_ESTRUCTURADO, presence_penalty: 0 },
      },
      { timeout: TIMEOUT_ESTRUCTURADO_MS },
    );

    const contenido: string = data?.message?.content ?? '';
    try {
      return JSON.parse(contenido);
    } catch {
      throw new Error(`La IA no devolvió un JSON válido: ${contenido.slice(0, 200)}`);
    }
  }
}
