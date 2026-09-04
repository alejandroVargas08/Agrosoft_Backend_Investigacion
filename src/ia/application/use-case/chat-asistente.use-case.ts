import { Injectable, Inject } from '@nestjs/common';
import type { IaProviderPort } from '../../domain/ports/ia-provider.port';

@Injectable()
export class ChatAsistenteUseCase {
  constructor(
    @Inject('IaProviderPort')
    private readonly iaProvider: IaProviderPort,
  ) {}

  async execute(mensaje: string, contexto?: string): Promise<string> {
    return this.iaProvider.chat(mensaje, contexto);
  }

  async analizarImagen(base64Image: string, prompt: string): Promise<string> {
    return this.iaProvider.analizarImagen(base64Image, prompt);
  }
}