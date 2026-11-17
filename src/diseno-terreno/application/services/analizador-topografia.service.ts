import { Inject, Injectable } from '@nestjs/common';
import type { ProveedorElevacionPort } from '../../domain/ports/proveedores-geo.port';
import { PROVEEDOR_ELEVACION_TOKEN } from '../../domain/ports/proveedores-geo.port';
import { ajustarPlano, muestrearPuntos, PuntoGeo } from '../../domain/value-objects/geo';
import { Topografia } from '../../domain/value-objects/perfil-terreno.vo';

@Injectable()
export class AnalizadorTopografiaService {
  constructor(
    @Inject(PROVEEDOR_ELEVACION_TOKEN)
    private readonly elevacion: ProveedorElevacionPort,
  ) {}

  async analizar(poligono: PuntoGeo[]): Promise<Topografia> {
    const puntos = muestrearPuntos(poligono);
    const elevaciones = await this.elevacion.obtenerElevaciones(puntos);
    const validos = puntos
      .map((punto, i) => ({ punto, z: elevaciones[i] }))
      .filter((p) => typeof p.z === 'number' && Number.isFinite(p.z));
    if (validos.length < 3) throw new Error('No hay suficientes elevaciones para calcular la pendiente');

    const zs = validos.map((p) => p.z);
    const plano = ajustarPlano(validos.map((p) => p.punto), zs);
    return {
      altitudPromedioM: Math.round(zs.reduce((a, b) => a + b, 0) / zs.length),
      altitudMinM: Math.round(Math.min(...zs)),
      altitudMaxM: Math.round(Math.max(...zs)),
      pendientePct: plano.pendientePct,
      azimutBajadaGrados: plano.azimutBajadaGrados,
      puntosMuestreados: validos.length,
      fuente: this.elevacion.nombre,
    };
  }
}
