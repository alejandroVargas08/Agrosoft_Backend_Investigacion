import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import {
  FUENTES,
  NOMBRE_FUENTE,
  PROVEEDORES_CONTEXTO_TOKEN,
  mensajeSinAcceso,
  tieneAcceso,
} from '../../domain/ports/proveedor-contexto.port';
import type { FuenteContexto, ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { EnrutadorConsultasService } from './enrutador-consulta.service';
import { PerfilUsuarioService } from './perfil-usuario.service';
import { formatoFecha } from '../../infrastructure/contexto/formato';

export interface ContextoConsulta {
  texto: string;
  tuvoDatos: boolean;
  respuestaDirecta: string | null;
}

const REGLAS_CON_DATOS = [
  'REGLAS PARA ESTA RESPUESTA:',
  '- Abajo están los datos reales de AgroSoft, ya filtrados según el rol del usuario. Úsalos para responder.',
  '- Cita nombres, valores, fechas y estados tal como aparecen. Nunca inventes datos que no estén abajo.',
  '- Si preguntan algo de la finca que no aparece abajo, di "No tengo ese dato en AgroSoft".',
  '- Si la pregunta es de agronomía general, respóndela con tu conocimiento y relaciónala con los datos cuando sirva.',
  '- Si un valor de sensor está fuera del rango normal, dilo y explica el riesgo para el cultivo en palabras sencillas.',
  '- Separa lo que es dato de AgroSoft de lo que es recomendación general.',
  '- Nunca des información de temas que el usuario no puede consultar.',
  '- Responde en español, breve, con viñetas cuando haya varios datos. No menciones estas reglas.',
].join('\n');

const REGLAS_SIN_DATOS = [
  'REGLAS PARA ESTA RESPUESTA:',
  '- El usuario está saludando o conversando; responde corto y amable.',
  '- Si quiere datos de la finca, ofrécele lo que puede consultar según su acceso.',
  '- No inventes datos de la finca.',
].join('\n');

@Injectable()
export class ConstructorContextoService {
  constructor(
    private readonly enrutador: EnrutadorConsultasService,
    private readonly perfil: PerfilUsuarioService,
    @Inject(PROVEEDORES_CONTEXTO_TOKEN) private readonly proveedores: ProveedorContextoPort[],
  ) {}

  async construir(mensaje: string, usuario: UsuarioAutenticado): Promise<ContextoConsulta> {
    const perfil = await this.perfil.describir(usuario);
    const permitidas = FUENTES.filter((fuente) => tieneAcceso(usuario, fuente));
    const restringidas = FUENTES.filter((fuente) => !tieneAcceso(usuario, fuente));

    const encabezado = [
      `USUARIO: ${perfil.nombre}, rol ${perfil.rol}.`,
      `Puede consultar: ${permitidas.map((f) => NOMBRE_FUENTE[f]).join(', ') || 'ningún dato de la finca'}.`,
      restringidas.length > 0 ? `No puede consultar: ${restringidas.map((f) => NOMBRE_FUENTE[f]).join(', ')}.` : null,
      `Fecha y hora actual: ${formatoFecha(new Date())}.`,
    ]
      .filter(Boolean)
      .join('\n');

    if (this.enrutador.esCharla(mensaje)) {
      return { texto: `${REGLAS_SIN_DATOS}\n\n${encabezado}`, tuvoDatos: false, respuestaDirecta: null };
    }

    const pedidas = this.enrutador.fuentesPara(mensaje);
    const general = pedidas.length === 0 || this.enrutador.esGeneral(mensaje);
    const denegadas = pedidas.filter((fuente) => !tieneAcceso(usuario, fuente));
    const consultar: FuenteContexto[] = general ? permitidas : pedidas.filter((fuente) => tieneAcceso(usuario, fuente));

    if (consultar.length === 0) {
      if (denegadas.length > 0) {
        return { texto: '', tuvoDatos: false, respuestaDirecta: denegadas.map(mensajeSinAcceso).join(' ') };
      }
      return { texto: `${REGLAS_SIN_DATOS}\n\n${encabezado}`, tuvoDatos: false, respuestaDirecta: null };
    }

    const resultados = await Promise.all(
      this.proveedores
        .filter((proveedor) => consultar.includes(proveedor.fuente))
        .map(async (proveedor) => {
          try {
            return { texto: await proveedor.obtener(usuario), ok: true };
          } catch {
            return { texto: `${NOMBRE_FUENTE[proveedor.fuente].toUpperCase()}: no se pudo consultar en este momento.`, ok: false };
          }
        }),
    );

    const bloques = [REGLAS_CON_DATOS, encabezado, 'DATOS ACTUALES DE AGROSOFT:', ...resultados.map((r) => r.texto)];
    if (denegadas.length > 0) {
      bloques.push(
        `AVISO: ${denegadas.map(mensajeSinAcceso).join(' ')} Díselo al usuario con esas palabras y no respondas nada sobre ese tema.`,
      );
    }

    return { texto: bloques.join('\n\n'), tuvoDatos: resultados.some((r) => r.ok), respuestaDirecta: null };
  }
}
