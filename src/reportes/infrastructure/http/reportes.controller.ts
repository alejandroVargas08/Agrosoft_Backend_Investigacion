import { Controller, Get, Query } from '@nestjs/common';
import { ObtenerReporteUseCase } from '../../application/use-cases/obtener-reporte.use-case';
import { ReporteClima, ReporteGeneral } from '../../application/dtos/reporte.dto';
import { Autenticado } from '../../../modules/iam/infrastructure/http/decorators/autenticado.decorator';

@Controller('reportes')
@Autenticado()
export class ReportesController {
    constructor(private readonly obtenerReporte: ObtenerReporteUseCase) {}

    // Va antes de @Get() por claridad; las rutas no chocan
    @Get('clima')
    clima(@Query('periodo') periodo?: string): Promise<ReporteClima> {
        return this.obtenerReporte.clima(periodo);
    }

    @Get()
    listar(@Query('periodo') periodo?: string): Promise<ReporteGeneral> {
        return this.obtenerReporte.ejecutar(periodo);
    }
}