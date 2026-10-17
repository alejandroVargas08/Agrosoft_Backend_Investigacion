import type { CapturaInterpretada, DatosInterpretacionCaptura, DatosSintesisVuelo } from '../../domain/ports/interprete-agronomico.port';
import { DistribucionCobertura } from '../../domain/value-objects/cobertura.vo';
import { EstadisticasIndice } from '../../domain/value-objects/estadisticas-indice.vo';
import { NIVELES, TIPOS_COBERTURA_VISUAL, TIPOS_HALLAZGO } from '../../domain/value-objects/interpretacion-ia.vo';
import { DistribucionClases } from '../../domain/value-objects/umbrales-ndvi.vo';

export const INCLINACION_MINIMA_VERTICAL = 80;
export const INCLINACION_MINIMA_SEMIVERTICAL = 60;

export const ESQUEMA_INTERPRETACION_CAPTURA: Record<string, unknown> = {
  type: 'object',
  properties: {
    coberturas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: [...TIPOS_COBERTURA_VISUAL] },
          porcentajeAproximado: { type: 'number' },
          descripcion: { type: 'string' },
        },
        required: ['tipo', 'porcentajeAproximado', 'descripcion'],
      },
    },
    cultivosVisibles: { type: 'array', items: { type: 'string' } },
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: [...TIPOS_HALLAZGO] },
          severidad: { type: 'string', enum: [...NIVELES] },
          ubicacionEnImagen: { type: 'string' },
          descripcion: { type: 'string' },
        },
        required: ['tipo', 'severidad', 'ubicacionEnImagen', 'descripcion'],
      },
    },
    zonaCandidataSiembra: {
      type: 'object',
      properties: {
        hayZonas: { type: 'boolean' },
        descripcion: { type: 'string' },
      },
      required: ['hayZonas', 'descripcion'],
    },
    recomendacion: { type: 'string' },
    confianza: { type: 'string', enum: [...NIVELES] },
  },
  required: ['coberturas', 'cultivosVisibles', 'hallazgos', 'zonaCandidataSiembra', 'recomendacion', 'confianza'],
};

export const ESQUEMA_SINTESIS_VUELO: Record<string, unknown> = {
  type: 'object',
  properties: {
    resumen: { type: 'string' },
    hallazgosPrincipales: { type: 'array', items: { type: 'string' } },
    zonasCandidatasSiembra: { type: 'string' },
    recomendaciones: { type: 'array', items: { type: 'string' } },
    advertencias: { type: 'array', items: { type: 'string' } },
  },
  required: ['resumen', 'hallazgosPrincipales', 'zonasCandidatasSiembra', 'recomendaciones', 'advertencias'],
};

const EXPLICACION_VIGOR = `Cómo leer el vigor (NDVI):
- Vigor alto (NDVI mayor a 0.6): vegetación densa y activa, como bosque o cultivo bien desarrollado.
- Vigor medio (0.4 a 0.6) y vigor bajo (0.2 a 0.4): es normal en pasto, rastrojo, cultivos jóvenes o recién podados, sombras, bordes de caminos y mezclas de suelo con plantas. Un vigor bajo o medio NO es por sí solo un problema ni una señal de estrés.
- Sin vegetación (menor a 0.2): construcciones, vías, suelo desnudo o agua.`;

function formatoIndice(estadisticas: EstadisticasIndice | null): string {
  return estadisticas ? estadisticas.promedio.toFixed(2) : 'sin dato';
}

function formatoPorcentaje(valor: number | undefined): string {
  return `${(valor ?? 0).toFixed(0)} %`;
}

function describirCobertura(cobertura: DistribucionCobertura | null): string {
  if (!cobertura) return 'sin dato';
  return `vegetación ${formatoPorcentaje(cobertura.VEGETACION)}, sin vegetación ${formatoPorcentaje(cobertura.SIN_VEGETACION)}, agua ${formatoPorcentaje(cobertura.AGUA)}`;
}

function describirVigor(distribucion: DistribucionClases): string {
  return `vigor alto ${formatoPorcentaje(distribucion.SALUDABLE)}, vigor medio ${formatoPorcentaje(distribucion.ESTRES_MODERADO)}, vigor bajo ${formatoPorcentaje(distribucion.ESTRES_ALTO)}, sin vegetación ${formatoPorcentaje(distribucion.SIN_VEGETACION)}`;
}

function describirAngulo(inclinacion: number | null): string {
  if (inclinacion == null) return 'desconocido; trata los porcentajes de área como aproximados';
  const grados = Math.abs(inclinacion);
  if (grados >= INCLINACION_MINIMA_VERTICAL) return `${grados.toFixed(0)}° hacia abajo (foto vertical)`;
  return `${grados.toFixed(0)}° hacia abajo (foto oblicua: los objetos lejanos, en la parte superior de la imagen, se ven más pequeños, así que los porcentajes de área son solo aproximados)`;
}

export function construirPromptCaptura(datos: DatosInterpretacionCaptura): string {
  return `Eres un asistente agronómico que interpreta fotografías aéreas tomadas con un dron DJI Mavic 3M sobre fincas en Colombia. Tu trabajo es describir con honestidad lo que se ve en la foto, sin exagerar problemas.

Datos de esta captura:
- Altura de vuelo: ${datos.altitudRelativaM != null ? `${datos.altitudRelativaM.toFixed(0)} m` : 'desconocida'}
- Ángulo de la cámara: ${describirAngulo(datos.inclinacionCamaraGrados)}
- Cultivos que el productor dice tener en la finca: ${datos.contexto ?? 'no indicado'}. Esto es solo contexto: no significa que aparezcan en esta foto.
- Medición multiespectral, calculada con las bandas del dron:
  - NDVI promedio: ${formatoIndice(datos.ndvi)}
  - Cobertura: ${describirCobertura(datos.cobertura)}
  - Distribución de vigor: ${describirVigor(datos.distribucionNdvi)}

${EXPLICACION_VIGOR}

Observa la fotografía RGB adjunta y completa el JSON solicitado:
1. coberturas: tipos de cobertura que ves y su porcentaje aproximado del área visible; deben sumar cerca de 100. Lo que la medición marca como "sin vegetación" puede ser construcción, vía o suelo desnudo: distínguelo por lo que ves.
2. cultivosVisibles: solo los cultivos que reconozcas por su aspecto en la foto, por ejemplo hileras de arbustos de café, hojas grandes de plátano o potreros de pasto. No copies la lista del productor. Si no puedes reconocer ninguno con seguridad, deja la lista vacía.
3. hallazgos: solo problemas que VES en la foto y cuya ubicación puedes señalar, como plantas amarillas o secas, parches sin plantas dentro de un cultivo, maleza, agua estancada o erosión. En ubicacionEnImagen indica dónde está (por ejemplo "esquina inferior derecha" o "centro, junto al camino"). No conviertas los porcentajes de vigor en hallazgos. No reportes plagas o enfermedades: desde esta altura no se pueden ver. Una lista vacía es una respuesta válida y frecuente.
4. zonaCandidataSiembra: indica si hay áreas de suelo desnudo o pasto, sin construcciones, sin agua y sin bosque, que podrían evaluarse para siembra, y dónde están en la imagen. Nunca propongas talar bosque ni sembrar junto al agua.
5. recomendacion: una o dos frases prácticas, basadas solo en lo que viste.
6. confianza: qué tan seguro estás de tu interpretación según la nitidez y el ángulo de la foto.

Responde en español. No inventes nada que no se vea en la fotografía.`;
}

function describirCaptura(captura: CapturaInterpretada, indice: number): string {
  const i = captura.interpretacion;
  const ubicacion = captura.ubicacion
    ? `${captura.ubicacion.latitud.toFixed(6)}, ${captura.ubicacion.longitud.toFixed(6)}`
    : 'sin GPS';
  const coberturas = i.coberturas.map((c) => `${c.tipo} ${c.porcentajeAproximado.toFixed(0)}%`).join(', ') || 'no identificadas';
  const hallazgos =
    i.hallazgos.map((h) => `${h.tipo} (${h.severidad}, ${h.ubicacionEnImagen || 'sin ubicación'}): ${h.descripcion}`).join('; ') ||
    'ninguno';
  const cultivos = i.cultivosVisibles.join(', ') || 'no identificados';
  const siembra = i.zonaCandidataSiembra.hayZonas ? `sí: ${i.zonaCandidataSiembra.descripcion}` : 'no';

  return `Captura ${indice + 1} (${captura.claveCaptura}, GPS ${ubicacion}, NDVI ${captura.ndviPromedio.toFixed(2)}, confianza ${i.confianza})
  - Coberturas vistas: ${coberturas}
  - Cultivos reconocidos: ${cultivos}
  - Hallazgos visibles: ${hallazgos}
  - Zona candidata para siembra: ${siembra}`;
}

export function construirPromptSintesis(datos: DatosSintesisVuelo): string {
  const r = datos.resumen;

  return `Eres un asistente agronómico. Redacta el informe de un vuelo de dron multiespectral sobre una finca en Colombia, dirigido al productor, en español claro y sin tecnicismos innecesarios.

Cultivos que el productor dice tener: ${datos.contexto ?? 'no indicado'}

Mediciones de las ${r.capturasAnalizadas} capturas analizadas:
- NDVI promedio ${formatoIndice(r.ndvi)}
- Cobertura: ${describirCobertura(r.cobertura)}
- Distribución de vigor: ${describirVigor(r.distribucionNdvi)}

${EXPLICACION_VIGOR}

Interpretación visual de las capturas revisadas:
${datos.capturas.map(describirCaptura).join('\n')}

Reglas:
- Habla de "las zonas sobrevoladas" o "las capturas analizadas", nunca de toda la finca: solo se revisaron ${datos.capturas.length} fotos.
- Los hallazgos principales deben salir únicamente de los "hallazgos visibles" de las capturas, indicando la captura y la ubicación. Si no hay hallazgos visibles, dilo y no inventes problemas.
- No presentes el vigor bajo o medio como un problema por sí solo.
- Si las capturas tienen confianza BAJA, menciónalo como limitación.

Completa el JSON solicitado:
- resumen: tres a cinco frases sobre lo que se observó.
- hallazgosPrincipales: los problemas visibles más importantes, o una lista vacía si no hubo.
- zonasCandidatasSiembra: describe las áreas que podrían evaluarse para siembra y en qué captura están, o indica que no se identificaron.
- recomendaciones: acciones concretas, priorizadas y coherentes con lo observado.
- advertencias: limitaciones del análisis; incluye siempre que los hallazgos y las zonas candidatas deben verificarse en campo y que la aptitud para siembra requiere análisis de suelo.`;
}
