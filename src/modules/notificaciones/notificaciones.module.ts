import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../iam/iam.module';

import { NotificacionOrmEntity } from './infrastructure/persistence/entities/notificacion.orm-entity';
import { DispositivoPushOrmEntity } from './infrastructure/persistence/entities/dispositivo-push.orm-entity';
import { NotificacionRepository } from './infrastructure/persistence/repositories/notificacion.repository';
import { NotificacionesController } from './infrastructure/http/controllers/notificaciones.controller';
import { DispositivosPushController } from './infrastructure/http/controllers/dispositivos-push.controller';
import { PushService } from './infrastructure/push/push.service';

import { CrearNotificacionUseCase } from './application/use-cases/crear-notificacion.use-case';
import { ListarNotificacionesPorUsuarioUseCase } from './application/use-cases/listar-notificaciones-por-usuario.use-case';
import { MarcarNotificacionLeidaUseCase } from './application/use-cases/marcar-notificacion-leida.use-case';
import { EliminarNotificacionUseCase } from './application/use-cases/eliminar-notificacion.use-case';

import { NOTIFICACION_REPOSITORY } from './domain/ports/notificacion.repository.token';

@Module({
  imports: [IamModule, TypeOrmModule.forFeature([NotificacionOrmEntity, DispositivoPushOrmEntity])],
  controllers: [NotificacionesController, DispositivosPushController],
  providers: [
    PushService,
    CrearNotificacionUseCase,
    ListarNotificacionesPorUsuarioUseCase,
    MarcarNotificacionLeidaUseCase,
    EliminarNotificacionUseCase,
    { provide: NOTIFICACION_REPOSITORY, useClass: NotificacionRepository },
  ],
  exports: [NOTIFICACION_REPOSITORY, PushService],
})
export class NotificacionesModule {}
