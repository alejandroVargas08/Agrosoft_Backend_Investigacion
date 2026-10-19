import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EstadoFormularioOrmEntity } from './infrastructure/persistence/estado-formulario.orm-entity';
import { ESTADO_FORMULARIO_REPOSITORY_PORT } from './domain/ports/estado-formulario.repository.port';
import { EstadoFormularioTypeOrmRepository } from './infrastructure/persistence/estado-formulario.typeorm-repository';

import { VinculoUsuarioOrmEntity } from './infrastructure/persistence/vinculo-usuario.orm-entity';
import { VINCULO_USUARIO_REPOSITORY_PORT } from './domain/ports/vinculo-usuario.repository.port';
import { VinculoUsuarioTypeOrmRepository } from './infrastructure/persistence/vinculo-usuario.typeorm-repository';

import { AgrosoftBot } from './infrastructure/bot/agrosoft.bot';
import { IncidenciasModule } from '../../../produccion/incidencias/infrastructure/incidencias.module';
import { TratamientosModule } from '../../../produccion/tratamientos/infrastructure/tratamientos.module';
import { ReportesModule } from '../../../reportes/infrastructure/reportes.module';
import { IotModule } from '../../iot/iot.module';
import { InventarioModule } from '../../inventario/inventario.module';
import { IamModule } from '../../iam/iam.module';

import { ObtenerOIniciarConversacionUseCase } from './application/use-cases/obtener-o-iniciar-conversacion.use-case';
import { AvanzarConversacionUseCase } from './application/use-cases/avanzar-conversacion.use-case';
import { FinalizarConversacionUseCase } from './application/use-cases/finalizar-conversacion.use-case';
import { VincularUsuarioUseCase } from './application/use-cases/vincular-usuario.use-case';
import { BuscarVinculoUseCase } from './application/use-cases/buscar-vinculo.use-case';
import { DesvincularUsuarioUseCase } from './application/use-cases/desvincular-usuario.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([EstadoFormularioOrmEntity, VinculoUsuarioOrmEntity]),
        IncidenciasModule,
        TratamientosModule,
        ReportesModule,
        IotModule,
        InventarioModule,
        IamModule,
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
        VincularUsuarioUseCase,
        BuscarVinculoUseCase,
        DesvincularUsuarioUseCase,

        { provide: ESTADO_FORMULARIO_REPOSITORY_PORT, useClass: EstadoFormularioTypeOrmRepository },
        { provide: VINCULO_USUARIO_REPOSITORY_PORT, useClass: VinculoUsuarioTypeOrmRepository },
    ],
    exports: [],
})
export class TelegramModule {}