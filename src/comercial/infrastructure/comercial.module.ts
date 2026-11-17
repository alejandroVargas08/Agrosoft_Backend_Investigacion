import { Module } from '@nestjs/common';
import { ComercialService } from '../application/use-cases/comercial.service';
import { ComercialController } from './controllers/comercial.controller';
import { IamModule } from '../../modules/iam/iam.module';

@Module({
  imports: [IamModule],
  controllers: [ComercialController],
  providers: [ComercialService],
})
export class ComercialModule {}