import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../iam/iam.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { PreferenciaNotificacionOrmEntity } from './infrastructure/persistence/preferencia-notificacion.orm-entity';
import { AvisoRegistroOrmEntity } from './infrastructure/persistence/aviso-registro.orm-entity';
import { PreferenciasService } from './application/preferencias.service';
import { AvisosService } from './application/avisos.service';
import { VigilanteAvisosService } from './application/vigilante-avisos.service';
import { PreferenciasNotificacionController } from './infrastructure/http/preferencias-notificacion.controller';

/**
 * Avisos de alertas de sensores, stock bajo, tareas vencidas e incidencias
 * nuevas. Van a la campana de la app y a los canales que se registren
 * (Telegram). Global para que Telegram pueda registrarse sin importarlo.
 */
@Global()
@Module({
    imports: [
        IamModule,
        NotificacionesModule,
        TypeOrmModule.forFeature([PreferenciaNotificacionOrmEntity, AvisoRegistroOrmEntity]),
    ],
    controllers: [PreferenciasNotificacionController],
    providers: [PreferenciasService, AvisosService, VigilanteAvisosService],
    exports: [AvisosService, PreferenciasService],
})
export class AvisosModule {}
