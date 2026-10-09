import { Module } from '@nestjs/common';
import { ReportesController } from './http/reportes.controller';
import { ReportesRepositoryImpl } from './persistence/reportes.repository.impl';
import { Reportes_Repository } from '../domain/ports/reportes.repository.port';
import { ObtenerReporteUseCase } from '../application/use-cases/obtener-reporte.use-case';

@Module({
    controllers: [ReportesController],
    providers: [
        { provide: Reportes_Repository, useClass: ReportesRepositoryImpl },
        ObtenerReporteUseCase,
    ],
    exports: [ObtenerReporteUseCase],
})
export class ReportesModule {}