import { Module } from '@nestjs/common';
import { CultivosModule } from './cultivos/infrastructure/cultivos.module';
import { LotesProduccionModule } from './lotes_produccion/infrastructure/lotes_produccion.module';
import { ActividadesModule } from './actividades/actividades.module';
import { HistorialCultivoModule } from './historial-cultivo/historial-cultivo.module';
import { ActividadHistorialModule } from './actividad-historial/infrastructure/actividad-historial.module';
import { ActividadInsumosModule } from './actividad-insumos/insfrastructure/actividad-insumos.module';

@Module({
  imports: [CultivosModule, LotesProduccionModule, ActividadesModule, HistorialCultivoModule, ActividadHistorialModule, ActividadInsumosModule]
})
export class ProduccionModule {}
