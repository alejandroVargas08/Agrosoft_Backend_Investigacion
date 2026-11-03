import { Injectable } from "@nestjs/common";
import { ConstructorContextoService } from "../services/constructor-contexto.service";
import { EnviarMensajeConversacionUseCase } from "../../../ia/application/use-case/enviar-mensaje-conversacion.use-case";
import type { UsuarioAutenticado } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";


@Injectable()
    export class ChatAgrobotUseCase{
        constructor(
            private readonly constructorContexto: ConstructorContextoService,
            private readonly enviarMensaje: EnviarMensajeConversacionUseCase,
        ){}
        async ejecutar(conversacionId: number, mensaje: string, usuario: UsuarioAutenticado): Promise<{respuesta: string}>{
            const contexto= await this.constructorContexto.construir(mensaje, usuario);
            return this.enviarMensaje.ejecutar({ conversacionId, mensaje, contexto });
        }
    }
