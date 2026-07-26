import { Module } from '@nestjs/common';
import { ProduccionModule } from './produccion/produccion.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({ }),
      ProduccionModule
    ],
})
export class AppModule {}
