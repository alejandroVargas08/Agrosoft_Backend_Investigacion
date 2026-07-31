import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './modules/iam/iam.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module'

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
    IamModule,
    NotificacionesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}