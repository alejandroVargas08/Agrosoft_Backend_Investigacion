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

// Módulos de negocio cuyos casos de uso llama el bot
import { IncidenciasModule } from '../../../produccion/incidencias/infrastructure/incidencias.module';
import { TratamientosModule } from '../../../produccion/tratamientos/infrastructure/tratamientos.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EstadoFormularioOrmEntity]),
        IncidenciasModule,
        TratamientosModule,
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