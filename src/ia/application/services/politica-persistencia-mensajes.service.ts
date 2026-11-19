import { Injectable } from '@nestjs/common';

export interface TurnoConversacion {
  mensaje: string;
  respuesta: string;
  tuvoDatos: boolean;
  tieneImagenes: boolean;
}

const CHARLA = /^(hola|hey|buenas|buenos d[ií]as|buenas tardes|buenas noches|qu[eé] tal|c[oó]mo est[aá]s|gracias|muchas gracias|ok|okey|vale|listo|perfecto|entendido|dale|de acuerdo|bueno|s[ií]|no|chao|adi[oó]s|hasta luego|ja+|jaja+|jeje+)[\s!.¡¿?,]*$/i;
const RESPUESTA_SIN_VALOR = /no tengo ese dato|no se pudo consultar|ocurri[oó] un error|int[eé]ntalo de nuevo m[aá]s tarde/i;
const SIN_ACCESO = /no tiene(s)? acceso/i;
const MINIMO_PALABRAS = 4;
const MINIMO_CARACTERES_RESPUESTA = 40;

@Injectable()
export class PoliticaPersistenciaMensajesService {
  debeGuardar(turno: TurnoConversacion): boolean {
    const respuesta = turno.respuesta.trim();
    const mensaje = turno.mensaje.trim();

    if (respuesta.length === 0) return false;
    if (mensaje.length === 0 && !turno.tieneImagenes) return false;
    if (RESPUESTA_SIN_VALOR.test(respuesta)) return false;
    if (turno.tieneImagenes) return true;
    if (CHARLA.test(mensaje)) return false;
    if (!turno.tuvoDatos && SIN_ACCESO.test(respuesta)) return false;
    if (turno.tuvoDatos) return true;
    if (respuesta.length < MINIMO_CARACTERES_RESPUESTA) return false;

    return mensaje.includes('?') || mensaje.split(/\s+/).filter(Boolean).length >= MINIMO_PALABRAS;
  }
}
