import { Module } from '@nestjs/common';
import { IamModule } from '../modules/iam/iam.module';
import { IotModule } from '../modules/iot/iot.module';
import { TerritorioModule } from '../modules/territorio/territorio.module';
import { DronesModule } from '../drones/drones.module';
import { iaModule } from '../ia/ia.module';
import { ReportesModule } from '../reportes/infrastructure/reportes.module';
import { PROVEEDORES_CONTEXTO_TOKEN } from './domain/ports/proveedor-contexto.port';
import type { ProveedorContextoPort } from './domain/ports/proveedor-contexto.port';
import { EnrutadorConsultasService } from './application/services/enrutador-consulta.service';
import { CatalogoLotesService } from './application/services/catalogo-lotes.service';
import { ConstructorContextoService } from './application/services/constructor-contexto.service';
import { PerfilUsuarioService } from './application/services/perfil-usuario.service';
import { ChatAgrobotUseCase } from './application/use-cases/chat-agrobot.use-case';
import { ProveedorContextoTareas } from './infrastructure/contexto/proveedor-contexto-tareas';
import { ProveedorContextoCultivos } from './infrastructure/contexto/proveedor-contexto-cultivos';
import { ProveedorContextoSensores } from './infrastructure/contexto/proveedor-contexto-sensores';
import { ProveedorContextoIncidencias } from './infrastructure/contexto/proveedor-contexto-incidencias';
import { ProveedorContextoInventario } from './infrastructure/contexto/proveedor-contexto-inventario';
import { ProveedorContextoDrones } from './infrastructure/contexto/proveedor-contexto-drones';
import { ProveedorContextoFinanzas } from './infrastructure/contexto/proveedor-contexto-finanzas';
import { ProveedorContextoUsuarios } from './infrastructure/contexto/proveedor-contexto-usuarios';
import { ProveedorContextoPlagas } from './infrastructure/contexto/proveedor-contexto-plagas';
import { WikiEpasModule } from '../modules/wiki-epas/wiki-epas.module';
import { AgrobotController } from './infrastructure/http/agrobot.controller';

@Module({
  imports: [IamModule, iaModule, IotModule, TerritorioModule, DronesModule, ReportesModule, WikiEpasModule],
  controllers: [AgrobotController],
  providers: [
    EnrutadorConsultasService,
    CatalogoLotesService,
    ConstructorContextoService,
    PerfilUsuarioService,
    ChatAgrobotUseCase,
    ProveedorContextoTareas,
    ProveedorContextoCultivos,
    ProveedorContextoSensores,
    ProveedorContextoIncidencias,
    ProveedorContextoInventario,
    ProveedorContextoDrones,
    ProveedorContextoFinanzas,
    ProveedorContextoUsuarios,
    ProveedorContextoPlagas,
    {
      provide: PROVEEDORES_CONTEXTO_TOKEN,
      useFactory: (...proveedores: ProveedorContextoPort[]) => proveedores,
      inject: [
        ProveedorContextoTareas,
        ProveedorContextoCultivos,
        ProveedorContextoSensores,
        ProveedorContextoIncidencias,
        ProveedorContextoInventario,
        ProveedorContextoDrones,
        ProveedorContextoFinanzas,
        ProveedorContextoUsuarios,
        ProveedorContextoPlagas,
      ],
    },
  ],
})
export class AgrobotModule {}
