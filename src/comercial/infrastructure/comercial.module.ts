import { Module } from '@nestjs/common';
import { ComercialService } from '../application/use-cases/comercial.service';
import { ComercialController } from './controllers/comercial.controller';

@Module({
  controllers: [ComercialController],
  providers: [ComercialService],
})
export class ComercialModule {}
