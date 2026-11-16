import { BadRequestException, Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ObtenerReporteUseCase } from '../../application/use-cases/obtener-reporte.use-case';
import { ReporteClima, ReporteGeneral } from '../../application/dtos/reporte.dto';
import type { ClimaDelDia } from '../../domain/ports/reportes.repository.port';
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

    // Promedio de temperatura, humedad y UV de las estaciones de un lote en un día
    @Get('clima/dia')
    climaDelDia(@Query('loteId', ParseIntPipe) loteId: number, @Query('fecha') fecha: string): Promise<ClimaDelDia> {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? '') || Number.isNaN(Date.parse(fecha))) {
            throw new BadRequestException('La fecha va en formato AAAA-MM-DD');
        }
        return this.obtenerReporte.climaDelDia(loteId, fecha);
    }

    @Get()
    listar(@Query('periodo') periodo?: string): Promise<ReporteGeneral> {
        return this.obtenerReporte.ejecutar(periodo);
    }
}