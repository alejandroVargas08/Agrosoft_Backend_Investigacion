import { Module } from '@nestjs/common';
import { CultivosModule } from './cultivos/infrastructure/cultivos.module';
import { LotesProduccionModule } from './lotes_produccion/infrastructure/lotes_produccion.module';
import { HistorialCultivoModule } from './historial-cultivo/historial-cultivo.module';
import { ActividadHistorialModule } from './actividad-historial/infrastructure/actividad-historial.module';
import { ActividadInsumosModule } from './actividad-insumos/infrastructure/actividad-insumos.module';
import { ActividadServiciosModule } from './actividad-servicios/infrastructure/actividad-servicios.module';
import { ActividadEvidenciasModule } from './actividad-evidencias/infrastructure/actividad-evidencias.module';
import { ActividadResponsablesModule } from './actividad-responsables/infrastructure/actividad-responsables.module';
import { ActividadHerramientasModule } from './actividad-herramientas/infrastructure/actividad-herramientas.module';
import { ActividadInsumosReservaModule } from './actividad-insumos-reserva/actividad-insumos-reserva.module';
import { UsosHerramientasModule } from './usos-herramientas/infrastructure/usos-herramientas.module';
import { ActividadInsumosUsoModule } from './actividad-insumos-uso/infrastructure/actividad-insumos-uso.module';
import { MovimientosProduccionModule } from './movimientos-produccion/infrastructure/movimientos-produccion.module';

@Module({
  imports: [CultivosModule, 
    LotesProduccionModule, 
    HistorialCultivoModule, 
    ActividadHistorialModule, 
    ActividadInsumosModule, 
    ActividadServiciosModule, 
    ActividadEvidenciasModule, 
    ActividadResponsablesModule, 
    ActividadHerramientasModule, 
    ActividadInsumosReservaModule, 
    UsosHerramientasModule, 
    ActividadInsumosUsoModule, 
    MovimientosProduccionModule]
})
export class ProduccionModule {}
