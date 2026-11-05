import { ForbiddenException, Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { ObtenerReporteUseCase } from '../../../reportes/application/use-cases/obtener-reporte.use-case';
import { PERMISOS_FINANZAS } from '../../../finanzas/infrastructure/permisos-finanzas';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { pesos } from './formato';

@Injectable()
export class ProveedorContextoFinanzas implements ProveedorContextoPort {
  readonly fuente = 'finanzas' as const;

  constructor(private readonly reporte: ObtenerReporteUseCase) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    if (!usuario.permisos.includes(PERMISOS_FINANZAS.VER)) {
      throw new ForbiddenException('No tienes acceso a la información de finanzas');
    }

    const datos = await this.reporte.ejecutar('mensual');
    const filas = datos.finanzas.map(
      (f) => `- ${f.periodo}: ingresos ${pesos(f.ingresos)}, egresos ${pesos(f.egresos)}, balance ${pesos(f.ingresos - f.egresos)}`,
    );

    return [
      'FINANZAS (últimos 6 meses):',
      `Resumen: ingresos ${pesos(datos.resumen.ingresos)}, egresos ${pesos(datos.resumen.egresos)}, rentabilidad ${datos.resumen.rentabilidad}, producción total ${datos.resumen.produccionTotalKg} kg, unidades productivas activas ${datos.resumen.unidadesActivas}`,
      ...filas,
    ].join('\n');
  }
}
