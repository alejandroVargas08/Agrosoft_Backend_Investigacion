import { Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import type { IaProviderPort } from '../../../ia/domain/ports/ia-provider.port';
import { IA_PROVIDER_TOKEN } from '../../../ia/domain/ports/ia-provider.token';
import { TIPOS_COBERTURA_VISUAL, TipoCoberturaVisual } from '../../../drones/domain/value-objects/interpretacion-ia.vo';
import { CuadriculaClasificada, DetectorCuadriculaPort } from '../../domain/ports/proveedores-geo.port';

const FILAS = 4;
const COLUMNAS = 4;
const LADO_IMAGEN = Number(process.env.DRON_IA_LADO_IMAGEN ?? 768);
const LETRAS = 'ABCDEFGH';

const CELDAS = Array.from({ length: FILAS * COLUMNAS }, (_, i) => `${LETRAS[Math.floor(i / COLUMNAS)]}${(i % COLUMNAS) + 1}`);

const ESQUEMA = {
  type: 'object',
  properties: {
    celdas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          celda: { type: 'string', enum: CELDAS },
          tipo: { type: 'string', enum: [...TIPOS_COBERTURA_VISUAL] },
        },
        required: ['celda', 'tipo'],
      },
    },
  },
  required: ['celdas'],
};

const PROMPT = `Eres un agrónomo que revisa fotos aéreas de dron tomadas en Colombia, mirando hacia abajo.
La foto está dividida en una cuadrícula de ${FILAS} filas (A a ${LETRAS[FILAS - 1]}, de arriba hacia abajo) y ${COLUMNAS} columnas (1 a ${COLUMNAS}, de izquierda a derecha). Cada celda tiene su nombre escrito en la esquina, por ejemplo A1 o ${CELDAS[CELDAS.length - 1]}.
Para CADA una de las ${FILAS * COLUMNAS} celdas di qué ocupa la mayor parte de esa celda:
- CONSTRUCCION: techos, casas, galpones, invernaderos, placas de cemento, muros.
- VIA: carreteras, caminos destapados, senderos anchos, parqueaderos.
- AGUA: ríos, quebradas, lagos, reservorios, charcos grandes.
- BOSQUE: árboles grandes o grupo denso de árboles.
- CULTIVO: plantas sembradas en hileras o parcelas.
- PASTO: potrero o pradera.
- SUELO_DESNUDO: tierra sin vegetación o recién arada.
- OTRO: lo que no encaje.
Un techo NUNCA es suelo aunque tenga color claro. Si dudas entre CONSTRUCCION y otra cosa, mira si tiene bordes rectos y sombra: eso es construcción.
Responde con las ${FILAS * COLUMNAS} celdas, una sola vez cada una.`;

@Injectable()
export class DetectorCuadriculaOllamaAdapter implements DetectorCuadriculaPort {
  constructor(
    @Inject(IA_PROVIDER_TOKEN)
    private readonly iaProvider: IaProviderPort,
  ) {}

  async clasificar(rutaImagen: string): Promise<CuadriculaClasificada> {
    const imagen = await this.prepararImagen(rutaImagen);
    const respuesta = (await this.iaProvider.generarEstructurado(PROMPT, ESQUEMA, [imagen])) as {
      celdas?: { celda?: string; tipo?: string }[];
    } | null;

    const celdas: TipoCoberturaVisual[][] = Array.from({ length: FILAS }, () => Array<TipoCoberturaVisual>(COLUMNAS).fill('OTRO'));
    let reconocidas = 0;
    for (const item of respuesta?.celdas ?? []) {
      const nombre = String(item?.celda ?? '').trim().toUpperCase();
      const fila = LETRAS.indexOf(nombre.charAt(0));
      const columna = Number(nombre.slice(1)) - 1;
      const tipo = item?.tipo as TipoCoberturaVisual;
      if (fila < 0 || fila >= FILAS || !(columna >= 0 && columna < COLUMNAS)) continue;
      if (!TIPOS_COBERTURA_VISUAL.includes(tipo)) continue;
      celdas[fila][columna] = tipo;
      reconocidas++;
    }
    if (reconocidas === 0) throw new Error('La IA no clasificó ninguna celda de la foto');
    return { filas: FILAS, columnas: COLUMNAS, celdas };
  }

  private async prepararImagen(ruta: string): Promise<string> {
    const base = await sharp(ruta)
      .rotate()
      .resize({ width: LADO_IMAGEN, height: LADO_IMAGEN, fit: 'inside', withoutEnlargement: true })
      .toBuffer({ resolveWithObject: true });
    const ancho = base.info.width;
    const alto = base.info.height;
    const anchoCelda = ancho / COLUMNAS;
    const altoCelda = alto / FILAS;
    const fuente = Math.max(14, Math.round(Math.min(anchoCelda, altoCelda) / 7));

    const lineas: string[] = [];
    for (let c = 1; c < COLUMNAS; c++) {
      const x = Math.round(c * anchoCelda);
      lineas.push(`<line x1="${x}" y1="0" x2="${x}" y2="${alto}" />`);
    }
    for (let f = 1; f < FILAS; f++) {
      const y = Math.round(f * altoCelda);
      lineas.push(`<line x1="0" y1="${y}" x2="${ancho}" y2="${y}" />`);
    }
    const etiquetas = CELDAS.map((nombre, i) => {
      const x = Math.round((i % COLUMNAS) * anchoCelda) + 6;
      const y = Math.round(Math.floor(i / COLUMNAS) * altoCelda) + fuente + 4;
      return `<text x="${x}" y="${y}">${nombre}</text>`;
    });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}">
<g stroke="#ffff00" stroke-width="3" opacity="0.9">${lineas.join('')}</g>
<g font-family="sans-serif" font-weight="bold" font-size="${fuente}" fill="#ffff00" stroke="#000000" stroke-width="2" paint-order="stroke">${etiquetas.join('')}</g>
</svg>`;

    const buffer = await sharp(base.data)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer();
    return buffer.toString('base64');
  }
}
