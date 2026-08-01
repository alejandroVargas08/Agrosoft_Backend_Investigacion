import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { actividadEvidencia } from './produccion/actividad-evidencias/domain/entities/actividad-evidencia.entity';
import { actividadHerramienta } from './produccion/actividad-herramientas/domain/entities/actividad-herramientas.entity';
import { actividadHistorial } from './produccion/actividad-historial/domain/entities/actividad-historial.entity';
import { actividadInsumo } from './produccion/actividad-insumos/domain/entities/actividad-insumos.entity';
import { actividadInsumoReserva } from './produccion/actividad-insumos-reserva/domain/entities/actividad-insumos-reserva.entity';
import { actividadInsumoUso } from './produccion/actividad-insumos-uso/domain/entities/actividad-insumos-uso.entity';
import { actividadResponsable } from './produccion/actividad-responsables/domain/entities/actividad-responsable.entity';
import { actividadServicio } from './produccion/actividad-servicios/domain/entities/actividad-servicios.entity';
import { Actividades } from './produccion/actividades/domain/entities/actividades.entity';
import { Cultivo } from './produccion/cultivos/domain/entities/cultivo.entity';
import { historialCultivo } from './produccion/historial-cultivo/domain/entities/historial-cultivo.entity';
import { loteProduccion } from './produccion/lotes_produccion/domain/entities/lotes.produccion.entity';
import { movimientoProduccion } from './produccion/movimientos-produccion/domain/entities/movimiento-produccion.entity';
import { usoHerramienta } from './produccion/usos-herramientas/domain/entities/uso-herramienta.entity';
import { actividad_evidenciaRepository } from './produccion/actividad-evidencias/domain/ports/actividad-evidencias.repository.port';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10), 
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        actividad_evidenciaRepository,
        actividadHerramienta,
        actividadHistorial,
        actividadInsumo,
        actividadInsumoReserva,
        actividadInsumoUso,
        actividadResponsable,
        actividadServicio,
        Actividades,
        Cultivo,
        historialCultivo,
        loteProduccion,
        movimientoProduccion,
        usoHerramienta,
        ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
}); 