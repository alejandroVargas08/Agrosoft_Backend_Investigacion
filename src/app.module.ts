import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
      synchronize: false
    }),
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}