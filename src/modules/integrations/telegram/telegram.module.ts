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

import { CodigoVinculacionOrmEntity } from './infrastructure/persistence/codigo-vinculacion.orm-entity';
import { CODIGO_VINCULACION_REPOSITORY_PORT } from './domain/ports/codigo-vinculacion.repository.port';
import { CodigoVinculacionTypeOrmRepository } from './infrastructure/persistence/codigo-vinculacion.typeorm-repository';
import { TelegramController } from './infrastructure/http/telegram.controller';

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
import { GenerarCodigoVinculacionUseCase } from './application/use-cases/generar-codigo-vinculacion.use-case';
import { VincularConCodigoUseCase } from './application/use-cases/vincular-con-codigo.use-case';
import { EstadoVinculacionUseCase } from './application/use-cases/estado-vinculacion.use-case';
import { DesvincularPorUsuarioUseCase } from './application/use-cases/desvincular-por-usuario.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([EstadoFormularioOrmEntity, VinculoUsuarioOrmEntity, CodigoVinculacionOrmEntity]),
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
    controllers: [TelegramController],
    providers: [
        AgrosoftBot,

        ObtenerOIniciarConversacionUseCase,
        AvanzarConversacionUseCase,
        FinalizarConversacionUseCase,
        VincularUsuarioUseCase,
        BuscarVinculoUseCase,
        DesvincularUsuarioUseCase,
        GenerarCodigoVinculacionUseCase,
        VincularConCodigoUseCase,
        EstadoVinculacionUseCase,
        DesvincularPorUsuarioUseCase,

        { provide: ESTADO_FORMULARIO_REPOSITORY_PORT, useClass: EstadoFormularioTypeOrmRepository },
        { provide: VINCULO_USUARIO_REPOSITORY_PORT, useClass: VinculoUsuarioTypeOrmRepository },
        { provide: CODIGO_VINCULACION_REPOSITORY_PORT, useClass: CodigoVinculacionTypeOrmRepository },
    ],
    exports: [],
})
export class TelegramModule {}