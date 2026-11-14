import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { IaProviderPort } from '../../../ia/domain/ports/ia-provider.port';
import { IA_PROVIDER_TOKEN } from '../../../ia/domain/ports/ia-provider.token';
import { TIPOS_COBERTURA_VISUAL, TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import {
  CuadriculaClasificada,
  DetectorCuadriculaPort,
  OpcionesCuadricula,
  OrigenImagen,
} from '../../domain/ports/proveedores-geo.port';

const LADO_IMAGEN = Number(process.env.DRON_IA_LADO_IMAGEN ?? 768);
const LETRAS = 'ABCDEFGHIJ';
const MAXIMO_LADO_CUADRICULA = LETRAS.length;

const DESCRIPCION_ORIGEN: Record<OrigenImagen, string> = {
  DRON: 'una foto aérea de dron tomada en Colombia, mirando hacia abajo',
  SATELITE: 'una imagen satelital vista desde arriba de una finca en Colombia (el norte está arriba)',
};

function nombresCeldas(filas: number, columnas: number): string[] {
  return Array.from({ length: filas * columnas }, (_, i) => `${LETRAS[Math.floor(i / columnas)]}${(i % columnas) + 1}`);
}

function construirPrompt(filas: number, columnas: number, origen: OrigenImagen): string {
  const celdas = nombresCeldas(filas, columnas);
  return `Eres un agrónomo que revisa ${DESCRIPCION_ORIGEN[origen]}.
La imagen está dividida en una cuadrícula de ${filas} filas (A a ${LETRAS[filas - 1]}, de arriba hacia abajo) y ${columnas} columnas (1 a ${columnas}, de izquierda a derecha). Cada celda tiene su nombre escrito en la esquina, por ejemplo A1 o ${celdas[celdas.length - 1]}.
Para CADA una de las ${celdas.length} celdas di qué ocupa la mayor parte de esa celda:
- CONSTRUCCION: SOLO techos y placas hechas por personas: color parejo (gris, rojo, blanco, azul o metálico), bordes rectos y esquinas en ángulo recto.
- VIA: carreteras, caminos destapados o pavimentados: franja alargada de tierra, gris o café que atraviesa la imagen.
- AGUA: SOLO superficie de agua visible: lisa, con reflejos o color uniforme de estanque. La vegetación oscura, las copas de árboles y las sombras NO son agua.
- BOSQUE: copas de árboles: manchas verdes redondeadas con textura rugosa y sombras, aunque sean oscuras.
- CULTIVO: plantas sembradas en hileras o parcelas.
- PASTO: potrero o pradera.
- SUELO_DESNUDO: tierra sin vegetación o recién arada.
- OTRO: lo que no encaje.
Un techo NUNCA es suelo aunque tenga color claro. Las copas de los árboles y los caminos NUNCA son CONSTRUCCION. Si la celda es mayormente verde, no es CONSTRUCCION.
Si dudas entre CONSTRUCCION y otra cosa, elige la otra cosa.
Si dudas si algo es AGUA, NO lo marques como AGUA: elige lo que más se parezca entre BOSQUE, PASTO o CULTIVO.
Responde con las ${celdas.length} celdas, una sola vez cada una.`;
}

function construirEsquema(filas: number, columnas: number) {
  return {
    type: 'object',
    properties: {
      celdas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            celda: { type: 'string', enum: nombresCeldas(filas, columnas) },
            tipo: { type: 'string', enum: [...TIPOS_COBERTURA_VISUAL] },
          },
          required: ['celda', 'tipo'],
        },
      },
    },
    required: ['celdas'],
  };
}

@Injectable()
export class DetectorCuadriculaOllamaAdapter implements DetectorCuadriculaPort {
  constructor(
    @Inject(IA_PROVIDER_TOKEN)
    private readonly iaProvider: IaProviderPort,
  ) {}

  async clasificar(imagen: string | Buffer, opciones: OpcionesCuadricula = {}): Promise<CuadriculaClasificada> {
    const filas = Math.min(MAXIMO_LADO_CUADRICULA, Math.max(1, opciones.filas ?? 4));
    const columnas = Math.min(MAXIMO_LADO_CUADRICULA, Math.max(1, opciones.columnas ?? 4));
    const origen = opciones.origen ?? 'DRON';

    const conCuadricula = await this.prepararImagen(imagen, filas, columnas);
    const respuesta = (await this.iaProvider.generarEstructurado(construirPrompt(filas, columnas, origen), construirEsquema(filas, columnas), [
      conCuadricula,
    ])) as { celdas?: { celda?: string; tipo?: string }[] } | null;

    const celdas: TipoCoberturaVisual[][] = Array.from({ length: filas }, () => Array<TipoCoberturaVisual>(columnas).fill('OTRO'));
    let reconocidas = 0;
    for (const item of respuesta?.celdas ?? []) {
      const nombre = String(item?.celda ?? '').trim().toUpperCase();
      const fila = LETRAS.indexOf(nombre.charAt(0));
      const columna = Number(nombre.slice(1)) - 1;
      const tipo = item?.tipo as TipoCoberturaVisual;
      if (fila < 0 || fila >= filas || !(columna >= 0 && columna < columnas)) continue;
      if (!TIPOS_COBERTURA_VISUAL.includes(tipo)) continue;
      celdas[fila][columna] = tipo;
      reconocidas++;
    }
    if (reconocidas === 0) throw new Error('La IA no clasificó ninguna celda de la imagen');
    return { filas, columnas, celdas };
  }

  private async prepararImagen(imagen: string | Buffer, filas: number, columnas: number): Promise<string> {
    const base = await sharp(imagen)
      .rotate()
      .resize({ width: LADO_IMAGEN, height: LADO_IMAGEN, fit: 'inside', withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
    const ancho = base.info.width;
    const alto = base.info.height;
    const anchoCelda = ancho / columnas;
    const altoCelda = alto / filas;
    const fuente = Math.max(12, Math.round(Math.min(anchoCelda, altoCelda) / 6));

    const lineas: string[] = [];
    for (let c = 1; c < columnas; c++) {
      const x = Math.round(c * anchoCelda);
      lineas.push(`<line x1="${x}" y1="0" x2="${x}" y2="${alto}" />`);
    }
    for (let f = 1; f < filas; f++) {
      const y = Math.round(f * altoCelda);
      lineas.push(`<line x1="0" y1="${y}" x2="${ancho}" y2="${y}" />`);
    }
    const etiquetas = nombresCeldas(filas, columnas).map((nombre, i) => {
      const x = Math.round((i % columnas) * anchoCelda) + 4;
      const y = Math.round(Math.floor(i / columnas) * altoCelda) + fuente + 2;
      return `<text x="${x}" y="${y}">${nombre}</text>`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}">
<g stroke="#ffff00" stroke-width="2" opacity="0.9">${lineas.join('')}</g>
<g font-family="sans-serif" font-weight="bold" font-size="${fuente}" fill="#ffff00" stroke="#000000" stroke-width="2" paint-order="stroke">${etiquetas.join('')}</g>
</svg>`;

    const buffer = await sharp(base.data)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer();
    return buffer.toString('base64');
  }
}
