import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import {
  MENSAJE_SIN_ACCESO,
  PERMISO_POR_FUENTE,
  PROVEEDORES_CONTEXTO_TOKEN,
} from '../../domain/ports/proveedor-contexto.port';
import type { FuenteContexto, ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { EnrutadorConsultasService } from './enrutador-consulta.service';

export interface ContextoConsulta {
  texto: string;
  tuvoDatos: boolean;
  respuestaDirecta: string | null;
}

const REGLAS_CON_DATOS =
  'REGLAS PARA ESTA RESPUESTA: responde únicamente con los datos de AgroSoft que aparecen abajo. ' + 'Si el usuario pide un dato que no aparece, di "No tengo ese dato en AgroSoft" y no lo inventes. ' + 'Los únicos sensores del sistema son temperatura del aire (°C) y humedad relativa (%) con DHT22, e índice UV con UVM-30A. ' + 'Cita los valores y la hora de la lectura. Si un valor está fuera del rango normal, dilo y explica el riesgo para el cultivo en palabras sencillas. ' + 'Separa lo que es dato medido de lo que es recomendación general.';

const REGLAS_SIN_DATOS =
  'REGLAS PARA ESTA RESPUESTA: en este mensaje no se consultaron datos de la finca. ' + 'No inventes valores de sensores, inventario, finanzas ni vuelos de dron. ' + 'Si el usuario pide datos de la finca, pídele que diga qué quiere consultar (sensores, inventario o dron).';

@Injectable()
export class ConstructorContextoService {
  constructor(
    private readonly enrutador: EnrutadorConsultasService,
    @Inject(PROVEEDORES_CONTEXTO_TOKEN) private readonly proveedores: ProveedorContextoPort[],
  ) {}

  async construir(mensaje: string, usuario: UsuarioAutenticado): Promise<ContextoConsulta> {
    const pedidas = this.enrutador.fuentesPara(mensaje);
    if (pedidas.length === 0) return { texto: REGLAS_SIN_DATOS, tuvoDatos: false, respuestaDirecta: null };

    const tieneAcceso = (fuente: FuenteContexto): boolean => {
      const permiso = PERMISO_POR_FUENTE[fuente];
      return permiso === undefined || usuario.permisos.includes(permiso);
    };
    const permitidas = pedidas.filter(tieneAcceso);
    const denegadas = pedidas.filter((fuente) => !tieneAcceso(fuente));

    if (permitidas.length === 0) {
      return {
        texto: '',
        tuvoDatos: false,
        respuestaDirecta: denegadas.map((fuente) => MENSAJE_SIN_ACCESO[fuente]).join(' '),
      };
    }

    const resultados = await Promise.all(
      this.proveedores
        .filter((proveedor) => permitidas.includes(proveedor.fuente))
        .map(async (proveedor) => {
          try {
            return { texto: await proveedor.obtener(usuario), ok: true };
          } catch {
            return { texto: `${proveedor.fuente.toUpperCase()}: no se pudo consultar en este momento.`, ok: false };
          }
        }),
    );

    const bloques = [REGLAS_CON_DATOS, 'DATOS ACTUALES DE AGROSOFT:', ...resultados.map((r) => r.texto)];
    if (denegadas.length > 0) {
      bloques.push(
        `AVISO: ${denegadas.map((fuente) => MENSAJE_SIN_ACCESO[fuente]).join(' ')} ` +
          'Díselo al usuario con esas palabras y no respondas nada sobre ese tema.',
      );
    }

    return { texto: bloques.join('\n\n'), tuvoDatos: resultados.some((r) => r.ok), respuestaDirecta: null };
  }
}
