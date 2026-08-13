import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TerritorioModule } from './modules/territorio/territorio.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { TelegramModule } from './modules/integrations/telegram/telegram.module';
import { ProductosAgroModule } from './produccion/productos-agro/infrastructure/productos-agro.module';
import { ComercialModule } from './comercial/infrastructure/comercial.module';
import { FinanzasModule } from './finanzas/infrastructure/finanzas.module';
import { ProduccionModule } from './produccion/produccion.module';
import { HistorialPreciosLoteModule } from './produccion/historial_precios_lote/infrastructure/historial_precios_lote.module';
import { VentasModule } from './comercial/ventas/infrastructure/ventas.module';
import { VentasDetallesModule } from './comercial/ventas-detalles/infrastructure/ventas-detalles.module';
import { ClientesModule } from './comercial/clientes/infrastructure/clientes.module';
import { FacturasModule } from './comercial/facturas/infrastructure/facturas.module';
import { PagosModule } from './comercial/pagos/infrastruture/pagos.module';
import { TransaccionesFinancierasModule } from './finanzas/transacciones-financieras/infrastructure/transacciones-financieras.module';
import { IamModule } from './modules/iam/iam.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      schema: 'public',
      synchronize: true,
      logging: true,
    }),
    TerritorioModule,
    InventarioModule,
    TelegramModule,
    ProductosAgroModule,
    ComercialModule,
    FinanzasModule,
    ProduccionModule,
    HistorialPreciosLoteModule,
    VentasModule,
    VentasDetallesModule,
    ClientesModule,
    FacturasModule,
    PagosModule,
    TransaccionesFinancierasModule,
    IamModule,
    NotificacionesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}