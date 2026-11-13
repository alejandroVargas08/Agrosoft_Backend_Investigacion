import { Injectable, Logger } from '@nestjs/common';
import { ProveedorObjetosPort, ResultadoObjetos } from '../../domain/ports/proveedores-geo.port';
import { centroide, PuntoGeo } from '../../domain/value-objects/geo';
import { MicrosoftEdificiosAdapter } from './microsoft-edificios.adapter';
import { OsmObjetosAdapter } from './osm-objetos.adapter';

const TIEMPO_MICROSOFT_MS = Number(process.env.MICROSOFT_EDIFICIOS_TIEMPO_MAX_S ?? 20) * 1000;

function conLimite<T>(promesa: Promise<T>, ms: number, mensaje: string): Promise<T> {
  return new Promise<T>((resolver, rechazar) => {
    const reloj = setTimeout(() => rechazar(new Error(mensaje)), ms);
    promesa.then(
      (valor) => {
        clearTimeout(reloj);
        resolver(valor);
      },
      (error) => {
        clearTimeout(reloj);
        rechazar(error);
      },
    );
  });
}

function dentroDe(p: PuntoGeo, poligono: PuntoGeo[]): boolean {
  let resultado = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const a = poligono[i];
    const b = poligono[j];
    if (a.lat > p.lat !== b.lat > p.lat && p.lng < ((b.lng - a.lng) * (p.lat - a.lat)) / (b.lat - a.lat) + a.lng) resultado = !resultado;
  }
  return resultado;
}

@Injectable()
export class ObjetosCombinadosAdapter implements ProveedorObjetosPort {
  private readonly logger = new Logger(ObjetosCombinadosAdapter.name);

  constructor(
    private readonly osm: OsmObjetosAdapter,
    private readonly microsoft: MicrosoftEdificiosAdapter,
  ) {}

  async obtenerObjetos(poligono: PuntoGeo[]): Promise<ResultadoObjetos> {
    const [deOsm, deMicrosoft] = await Promise.allSettled([
      this.osm.obtenerObjetos(poligono),
      conLimite(
        this.microsoft.obtenerObjetos(poligono),
        TIEMPO_MICROSOFT_MS,
        'la descarga sigue en curso; los edificios aparecerán en la próxima evaluación',
      ),
    ]);
    const fallas: ResultadoObjetos['fallas'] = [];
    if (deOsm.status === 'rejected') {
      this.logger.warn(`OpenStreetMap: ${this.mensaje(deOsm.reason)}`);
      fallas.push({ fuente: 'Vías, agua y árboles (OpenStreetMap)', mensaje: this.mensaje(deOsm.reason) });
    }
    if (deMicrosoft.status === 'rejected') {
      this.logger.warn(`Edificios de Microsoft: ${this.mensaje(deMicrosoft.reason)}`);
      fallas.push({ fuente: 'Edificios de Microsoft', mensaje: this.mensaje(deMicrosoft.reason) });
    }
    if (deOsm.status === 'rejected' && deMicrosoft.status === 'rejected') {
      throw new Error(`no respondieron OpenStreetMap ni Microsoft (${this.mensaje(deOsm.reason)})`);
    }

    const osm = deOsm.status === 'fulfilled' ? deOsm.value : [];
    const edificiosOsm = osm.filter((o) => o.tipo === 'CONSTRUCCION' && o.forma === 'POLIGONO');
    const microsoft = (deMicrosoft.status === 'fulfilled' ? deMicrosoft.value : []).filter((m) => {
      const centro = centroide(m.puntos);
      return !edificiosOsm.some((o) => dentroDe(centro, o.puntos));
    });
    return { objetos: [...osm, ...microsoft], fallas };
  }

  private mensaje(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
