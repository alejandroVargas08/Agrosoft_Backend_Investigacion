import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../modules/iam/iam.module';

import { IaController } from './application/http/ia.controller';

import { CrearConversacionUseCase } from './application/use-case/crear-conversacion.use-case';
import { ListarConversacionesUseCase } from './application/use-case/listar-conversaciones.use-case';
import { ObtenerMensajesUseCase } from './application/use-case/obtener-mensajes.use-case';
import { EnviarMensajeConversacionUseCase } from './application/use-case/enviar-mensaje-conversacion.use-case';
import { EnviarImagenesConversacionUseCase } from './application/use-case/enviar-imagenes-conversacion.use-case';

import { OllamaAdapter } from './infrastructure/ollama/ollama.adapter';

import { ConversacionIAOrmEntity } from './infrastructure/persistence/entities/conversacion-ia.orm-entity';
import { MensajeIAOrmEntity } from './infrastructure/persistence/entities/mensaje-ia.orm-entity';
import { ConversacionIARepository } from './infrastructure/persistence/repositories/conversacion-ia.repository';
import { MensajeIARepository } from './infrastructure/persistence/repositories/mensaje-ia.repository';

import { CONVERSACION_IA_REPOSITORY } from './domain/ports/conversacion-ia.repository.token';
import { MENSAJE_IA_REPOSITORY } from './domain/ports/mensaje-ia.repository.token';
import { IA_PROVIDER_TOKEN } from './domain/ports/ia-provider.token';

@Module({
  imports: [
    ConfigModule,
    IamModule,
    TypeOrmModule.forFeature([ConversacionIAOrmEntity, MensajeIAOrmEntity]),
  ],
  controllers: [IaController],
  providers: [
    CrearConversacionUseCase,
    ListarConversacionesUseCase,
    ObtenerMensajesUseCase,
    EnviarMensajeConversacionUseCase,
    EnviarImagenesConversacionUseCase,
    {
      provide: IA_PROVIDER_TOKEN,
      useClass: OllamaAdapter,
    },
    {
      provide: CONVERSACION_IA_REPOSITORY,
      useClass: ConversacionIARepository,
    },
    {
      provide: MENSAJE_IA_REPOSITORY,
      useClass: MensajeIARepository,
    },
  ],
  exports: [EnviarMensajeConversacionUseCase, EnviarImagenesConversacionUseCase, IA_PROVIDER_TOKEN],
})
export class iaModule {}
