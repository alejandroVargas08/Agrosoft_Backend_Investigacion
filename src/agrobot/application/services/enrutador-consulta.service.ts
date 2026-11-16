import { Injectable } from '@nestjs/common';
import type { FuenteContexto } from '../../domain/ports/proveedor-contexto.port';

const PALABRAS: Record<FuenteContexto, RegExp> = {
  sensores: /sensor|estaci[oó]n|temperatura|humedad|\buv\b|radiaci[oó]n|clima|alerta|hongo|calor|fr[ií]o/i,
  inventario: /insumo|inventario|stock|existencia|fertilizante|herramienta|se acaba|m[ií]nimo/i,
  drones: /dron|vuelo|ndvi|ndre|gndvi|ndwi|an[aá]lisis|estr[eé]s|cobertura|multiespectral|salud del (lote|cultivo)/i,
  finanzas: /dinero|plata|finanz|ingreso|egreso|gasto|ganancia|rentabilidad|\bventas?\b|factura|pago|cliente|cobr|costo|presupuesto|precio|balance/i,
};

@Injectable()
export class EnrutadorConsultasService {
  fuentesPara(mensaje: string): FuenteContexto[] {
    return (Object.keys(PALABRAS) as FuenteContexto[]).filter((fuente) => PALABRAS[fuente].test(mensaje));
  }
}
