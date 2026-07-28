import { Module } from '@nestjs/common';
import { CultivosModule } from './cultivos/infrastructure/cultivos.module';
import { LotesProduccionModule } from './lotes_produccion/infrastructure/lotes_produccion.module';
import { ActividadesModule } from './actividades/actividades.module';
import { HistorialCultivoModule } from './historial-cultivo/historial-cultivo.module';
import { ActividadHistorialModule } from './actividad-historial/infrastructure/actividad-historial.module';
import { ActividadInsumosModule } from './actividad-insumos/insfrastructure/actividad-insumos.module';
import { ActividadServiciosModule } from './actividad-servicios/infrastructure/actividad-servicios.module';
import { ActividadEvidenciasModule } from './actividad-evidencias/infrastructure/actividad-evidencias.module';
import { ActividadResponsablesModule } from './actividad-responsables/insfrastructure/actividad-responsables.module';
import { ActividadHerramientasModule } from './actividad-herramientas/actividad-herramientas.module';

@Module({
  imports: [CultivosModule, LotesProduccionModule, ActividadesModule, HistorialCultivoModule, ActividadHistorialModule, ActividadInsumosModule, ActividadServiciosModule, ActividadEvidenciasModule, ActividadResponsablesModule, ActividadHerramientasModule]
})
export class ProduccionModule {}
