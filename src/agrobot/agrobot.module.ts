import { Module } from '@nestjs/common';
import { IamModule } from '../modules/iam/iam.module';
import { IotModule } from '../modules/iot/iot.module';
import { InventarioModule } from '../modules/inventario/inventario.module';
import { TerritorioModule } from '../modules/territorio/territorio.module';
import { DronesModule } from '../drones/drones.module';
import { iaModule } from '../ia/ia.module';
import { PROVEEDORES_CONTEXTO_TOKEN } from './domain/ports/proveedor-contexto.port';
import type { ProveedorContextoPort } from './domain/ports/proveedor-contexto.port';
import { EnrutadorConsultasService } from './application/services/enrutador-consulta.service';
import { CatalogoLotesService } from './application/services/catalogo-lotes.service';
import { ConstructorContextoService } from './application/services/constructor-contexto.service';
import { ChatAgrobotUseCase } from './application/use-cases/chat-agrobot.use-case';
import { ProveedorContextoSensores } from './infrastructure/contexto/proveedor-contexto-sensores';
import { ProveedorContextoInventario } from './infrastructure/contexto/proveedor-contexto-inventario';
import { ProveedorContextoDrones } from './infrastructure/contexto/proveedor-contexto-drones';
import { AgrobotController } from './infrastructure/http/agrobot.controller';
import { ReportesModule } from '../reportes/infrastructure/reportes.module';
import { ProveedorContextoFinanzas } from './infrastructure/contexto/proveedor-contexto-finanzas';

@Module({
  imports: [IamModule, iaModule, IotModule, InventarioModule, TerritorioModule, DronesModule, ReportesModule],
  controllers: [AgrobotController],
  providers: [
    EnrutadorConsultasService,
    CatalogoLotesService,
    ConstructorContextoService,
    ChatAgrobotUseCase,
    ProveedorContextoSensores,
    ProveedorContextoInventario,
    ProveedorContextoDrones,
    ProveedorContextoFinanzas,
    {
    provide: PROVEEDORES_CONTEXTO_TOKEN,
    useFactory: (...proveedores: ProveedorContextoPort[]) => proveedores,
    inject: [ProveedorContextoSensores, ProveedorContextoInventario, ProveedorContextoDrones, ProveedorContextoFinanzas],
    },
  ],
})
export class AgrobotModule {}
