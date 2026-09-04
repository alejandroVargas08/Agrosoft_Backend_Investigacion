import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EstadoFormularioOrmEntity } from './infrastructure/persistence/estado-formulario.orm-entity';
import { ESTADO_FORMULARIO_REPOSITORY_PORT } from './domain/ports/estado-formulario.repository.port';
import { EstadoFormularioTypeOrmRepository } from './infrastructure/persistence/estado-formulario.typeorm-repository';

import { AgrosoftBot } from './infrastructure/bot/agrosoft.bot';

import { ObtenerOIniciarConversacionUseCase } from './application/use-cases/obtener-o-iniciar-conversacion.use-case';
import { AvanzarConversacionUseCase } from './application/use-cases/avanzar-conversacion.use-case';
import { FinalizarConversacionUseCase } from './application/use-cases/finalizar-conversacion.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([EstadoFormularioOrmEntity]),
        TelegrafModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            token: configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '',
        }),
        }),
    ],
    providers: [
        AgrosoftBot,

        ObtenerOIniciarConversacionUseCase,
        AvanzarConversacionUseCase,
        FinalizarConversacionUseCase,

        { provide: ESTADO_FORMULARIO_REPOSITORY_PORT, useClass: EstadoFormularioTypeOrmRepository },
    ],
    exports: [],
    })
    export class TelegramModule {}