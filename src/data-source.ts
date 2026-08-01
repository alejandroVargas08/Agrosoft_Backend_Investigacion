import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { actividadEvidenciaOrmEntity } from './produccion/actividad-evidencias/infrastructure/persistence/actividad-evidencia.orm-entity';
import { actividadInsumoOrmEntity } from './produccion/actividad-insumos/infrastructure/persistence/actividad-insumo.orm-entity';
import { actividadHerramientaOrmEntity } from './produccion/actividad-herramientas/infrastructure/persistence/actividad-herramienta.orm-entity';
import { actividadHistorialOrmEntity } from './produccion/actividad-historial/infrastructure/persistence/actividad-historial.orm-entity';
import { actividadInsumoReservaOrmEntity } from './produccion/actividad-insumos-reserva/infrastructure/persistence/actividad-insumo-reserva.orm-entity';
import { actividadInsumoUsoOrmEntity } from './produccion/actividad-insumos-uso/infrastructure/persistence/actividad-insumo-uso.orm-entity';
import { actividadResponsableOrmEntity } from './produccion/actividad-responsables/infrastructure/persistence/actividad-responsables.orm-entity';
import { actividadServicioOrmEntity } from './produccion/actividad-servicios/infrastructure/persistence/actividad-servicios.orm-entity';
import { actividadesOrmEntity } from './produccion/actividades/infrastructure/persistence/actividades.orm-entity';
import { CultivoOrmEntity } from './produccion/cultivos/infrastructure/persistence/cultivo.orm-entity';
import { historialCultivoOrmEntity } from './produccion/historial-cultivo/infrastructure/persistence/historial-cultivo.orm-entity';
import { LoteProduccionOrmEntity } from './produccion/lotes_produccion/infrastructure/persistence/lote.produccion.orm-entity';
import { movimientoProduccionOrmEntity } from './produccion/movimientos-produccion/infrastructure/persistence/movimiento-produccion.orm-entity';
import { usoHerramientaOrmEntity } from './produccion/usos-herramientas/infrastructure/persistence/uso-herramienta.orm-entity';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10), 
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        actividadEvidenciaOrmEntity,
        actividadHerramientaOrmEntity,
        actividadHistorialOrmEntity,
        actividadInsumoOrmEntity,
        actividadInsumoReservaOrmEntity,
        actividadInsumoUsoOrmEntity,
        actividadResponsableOrmEntity,
        actividadServicioOrmEntity,
        actividadesOrmEntity,
        CultivoOrmEntity,
        historialCultivoOrmEntity,
        LoteProduccionOrmEntity,
        movimientoProduccionOrmEntity,
        usoHerramientaOrmEntity,
        ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
}); 