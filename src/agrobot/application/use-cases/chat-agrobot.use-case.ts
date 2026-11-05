import { Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { EnviarMensajeConversacionUseCase } from '../../../ia/application/use-case/enviar-mensaje-conversacion.use-case';
import { ConstructorContextoService } from '../services/constructor-contexto.service';

@Injectable()
export class ChatAgrobotUseCase {
  constructor(
    private readonly constructorContexto: ConstructorContextoService,
    private readonly enviarMensaje: EnviarMensajeConversacionUseCase,
  ) {}

  async ejecutar(conversacionId: number, mensaje: string, usuario: UsuarioAutenticado): Promise<{ respuesta: string; guardado: boolean }> {
    const { texto, tuvoDatos, respuestaDirecta } = await this.constructorContexto.construir(mensaje, usuario);
    if (respuestaDirecta !== null) return { respuesta: respuestaDirecta, guardado: false };
    return this.enviarMensaje.ejecutar({ conversacionId, mensaje, contexto: texto, tuvoDatos });
  }
}
