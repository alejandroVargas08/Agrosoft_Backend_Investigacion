import { Injectable } from '@nestjs/common';
import type { FuenteContexto } from '../../domain/ports/proveedor-contexto.port';

const PALABRAS: Record<FuenteContexto, RegExp> = {
  tareas: /tarea|actividad|asignad|asignaci|entreg|pendiente|revisar|revisi[oó]n|devuelt|aprobad|plazo|venc|aprendic|aprendiz/i,
  cultivos: /cultivo|lote|siembra|sembr|cosecha|planta|hect[aá]rea|[aá]rea|terreno|parcela|sublote/i,
  sensores: /sensor|estaci[oó]n|temperatura|humedad|\buv\b|radiaci[oó]n|clima|alerta|calor|fr[ií]o|lluvia/i,
  incidencias: /incidencia|plaga|enfermedad|problema|da[ñn]o|roya|hongo|insecto|gusano|mancha|tratamiento/i,
  inventario: /insumo|inventario|stock|existencia|fertilizante|herramienta|bodega|almac[eé]n|se acaba|m[ií]nimo|abono|semilla/i,
  drones: /dron|vuelo|ndvi|ndre|gndvi|ndwi|an[aá]lisis|estr[eé]s|cobertura|multiespectral|salud del (lote|cultivo)/i,
  plagas: /plaga|enfermedad|arvense|maleza|\bepa\b|broca|roya|hongo|insecto|gusano|hormiga|mancha|s[ií]ntoma|tratar|tratamiento|control(ar)? (de|la|el)|fumig/i,
  finanzas: /dinero|plata|finanz|ingreso|egreso|gasto|ganancia|rentabilidad|\bventas?\b|factura|pago|cliente|cobr|costo|presupuesto|precio|balance/i,
  usuarios: /usuario|solicitud|registr|cuenta|instructor|personas|gente|equipo/i,
};

const GENERAL = /resum|todo|general|finca|granja|unidad productiva|c[oó]mo (va|est[aá]|vamos)|estado de|qu[eé] (hay|tengo|falta|pasa|debo|hago)|novedad|hoy|panorama|informe|reporte|situaci[oó]n|prioridad|urgente|pendientes/i;

const CHARLA = /^(hola|hey|buenas|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|c[oó]mo est[aá]s|gracias|muchas gracias|ok|okey|vale|listo|perfecto|entendido|dale|de acuerdo|bueno|s[ií]|no|chao|adi[oó]s|hasta luego|ja+|jaja+|jeje+)[\s!.¡¿?,]*$/i;

@Injectable()
export class EnrutadorConsultasService {
  fuentesPara(mensaje: string): FuenteContexto[] {
    return (Object.keys(PALABRAS) as FuenteContexto[]).filter((fuente) => PALABRAS[fuente].test(mensaje));
  }

  esGeneral(mensaje: string): boolean {
    return GENERAL.test(mensaje);
  }

  esCharla(mensaje: string): boolean {
    return CHARLA.test(mensaje.trim());
  }
}
