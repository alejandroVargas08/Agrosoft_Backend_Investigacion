import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { IaProviderPort } from '../../../ia/domain/ports/ia-provider.port';
import { IA_PROVIDER_TOKEN } from '../../../ia/domain/ports/ia-provider.token';
import type {
  DatosInterpretacionCaptura,
  DatosSintesisVuelo,
  InterpreteAgronomicoPort,
} from '../../domain/ports/interprete-agronomico.port';
import {
  CoberturaVisual,
  HallazgoVisual,
  InterpretacionCaptura,
  Nivel,
  NIVELES,
  SintesisVuelo,
  TIPOS_COBERTURA_VISUAL,
  TIPOS_HALLAZGO,
  TipoCoberturaVisual,
  TipoHallazgo,
} from '../../domain/value-objects/interpretacion-ia.vo';
import {
  construirPromptCaptura,
  construirPromptSintesis,
  ESQUEMA_INTERPRETACION_CAPTURA,
  ESQUEMA_SINTESIS_VUELO,
  INCLINACION_MINIMA_SEMIVERTICAL,
  INCLINACION_MINIMA_VERTICAL,
} from './prompts-agronomicos';

const LADO_MAXIMO_IMAGEN = 1024;
const CALIDAD_JPEG = 80;
const MAXIMO_ELEMENTOS = 10;
const MAXIMO_CARACTERES = 600;

type Objeto = Record<string, unknown>;

@Injectable()
export class InterpreteAgronomicoOllamaAdapter implements InterpreteAgronomicoPort {
  constructor(
    @Inject(IA_PROVIDER_TOKEN)
    private readonly iaProvider: IaProviderPort,
  ) {}

  async interpretarCaptura(datos: DatosInterpretacionCaptura): Promise<InterpretacionCaptura> {
    const imagen = await this.prepararImagen(datos.rutaImagenRgb);
    const respuesta = await this.iaProvider.generarEstructurado(
      construirPromptCaptura(datos),
      ESQUEMA_INTERPRETACION_CAPTURA,
      [imagen],
    );
    const interpretacion = this.normalizarInterpretacion(respuesta);
    return {
      ...interpretacion,
      confianza: this.limitarConfianza(interpretacion.confianza, datos.inclinacionCamaraGrados),
    };
  }

  async sintetizarVuelo(datos: DatosSintesisVuelo): Promise<SintesisVuelo> {
    const respuesta = await this.iaProvider.generarEstructurado(construirPromptSintesis(datos), ESQUEMA_SINTESIS_VUELO);
    const objeto = this.objeto(respuesta);
    return {
      resumen: this.texto(objeto.resumen),
      hallazgosPrincipales: this.listaTextos(objeto.hallazgosPrincipales),
      zonasCandidatasSiembra: this.texto(objeto.zonasCandidatasSiembra),
      recomendaciones: this.listaTextos(objeto.recomendaciones),
      advertencias: this.listaTextos(objeto.advertencias),
    };
  }

  private async prepararImagen(ruta: string): Promise<string> {
    const buffer = await sharp(ruta)
      .rotate()
      .resize({ width: LADO_MAXIMO_IMAGEN, height: LADO_MAXIMO_IMAGEN, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: CALIDAD_JPEG })
      .toBuffer();
    return buffer.toString('base64');
  }

  private normalizarInterpretacion(respuesta: unknown): InterpretacionCaptura {
    const objeto = this.objeto(respuesta);
    const zona = this.objeto(objeto.zonaCandidataSiembra);

    const coberturas: CoberturaVisual[] = this.lista(objeto.coberturas).map((item) => {
      const c = this.objeto(item);
      return {
        tipo: this.enumeracion<TipoCoberturaVisual>(c.tipo, TIPOS_COBERTURA_VISUAL, 'OTRO'),
        porcentajeAproximado: this.porcentaje(c.porcentajeAproximado),
        descripcion: this.texto(c.descripcion),
      };
    });

    const hallazgos: HallazgoVisual[] = this.lista(objeto.hallazgos).map((item) => {
      const h = this.objeto(item);
      return {
        tipo: this.enumeracion<TipoHallazgo>(h.tipo, TIPOS_HALLAZGO, 'OTRO'),
        severidad: this.enumeracion<Nivel>(h.severidad, NIVELES, 'MEDIA'),
        ubicacionEnImagen: this.texto(h.ubicacionEnImagen),
        descripcion: this.texto(h.descripcion),
      };
    });

    return {
      coberturas,
      cultivosVisibles: this.listaTextos(objeto.cultivosVisibles),
      hallazgos,
      zonaCandidataSiembra: {
        hayZonas: zona.hayZonas === true,
        descripcion: this.texto(zona.descripcion),
      },
      recomendacion: this.texto(objeto.recomendacion),
      confianza: this.enumeracion<Nivel>(objeto.confianza, NIVELES, 'BAJA'),
    };
  }

  private limitarConfianza(confianza: Nivel, inclinacion: number | null): Nivel {
    const grados = inclinacion == null ? null : Math.abs(inclinacion);
    const maxima: Nivel =
      grados == null ? 'MEDIA' : grados >= INCLINACION_MINIMA_VERTICAL ? 'ALTA' : grados >= INCLINACION_MINIMA_SEMIVERTICAL ? 'MEDIA' : 'BAJA';
    return NIVELES.indexOf(confianza) <= NIVELES.indexOf(maxima) ? confianza : maxima;
  }

  private objeto(valor: unknown): Objeto {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor) ? (valor as Objeto) : {};
  }

  private lista(valor: unknown): unknown[] {
    return Array.isArray(valor) ? valor.slice(0, MAXIMO_ELEMENTOS) : [];
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim().slice(0, MAXIMO_CARACTERES) : '';
  }

  private listaTextos(valor: unknown): string[] {
    return this.lista(valor)
      .map((item) => this.texto(item))
      .filter((item) => item.length > 0);
  }

  private porcentaje(valor: unknown): number {
    const numero = typeof valor === 'number' ? valor : parseFloat(String(valor));
    if (!Number.isFinite(numero)) return 0;
    return Math.round(Math.min(100, Math.max(0, numero)));
  }

  private enumeracion<T extends string>(valor: unknown, permitidos: readonly T[], porDefecto: T): T {
    const texto = typeof valor === 'string' ? valor.trim().toUpperCase() : '';
    return (permitidos as readonly string[]).includes(texto) ? (texto as T) : porDefecto;
  }
}
