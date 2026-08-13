import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { IotModule } from './modules/iot/iot.module';
import { WikiEpasModule } from './modules/wiki-epas/wiki-epas.module';

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
      synchronize: false,
    }),
    IotModule,
    WikiEpasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}