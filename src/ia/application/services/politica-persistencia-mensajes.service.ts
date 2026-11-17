import { Injectable } from "@nestjs/common";

export interface TurnoConversacion{
    mensaje: string;
    respuesta: string;
    tuvoDatos: boolean;
    tieneImagenes: boolean;
} 

const CHARLA = /^(hola|buenas|buenos d[ií]as|buenas tardes|buenas noches|gracias|muchas gracias|ok|vale|listo|perfecto|entendido|dale|de acuerdo|chao|adi[oó]s|hasta luego)[\s!.¡¿?]*$/i;
const SIN_DATO = /no tengo ese dato/i;
const MINIMO_PALABRAS = 4;

@Injectable()
    export class PoliticaPersistenciaMensajesService{
        debeGuardar(turno: TurnoConversacion):boolean{
            const respuesta = turno.respuesta.trim();
            if(respuesta.length ===0 || SIN_DATO.test(respuesta))
                return false;
            if(turno.tieneImagenes || turno.tuvoDatos)
                return true; 

        const mensaje = turno.mensaje.trim();
        if (CHARLA.test(mensaje)) 
            return false;
        return mensaje.includes('?') || mensaje.split(/\s+/).filter(Boolean).length >= MINIMO_PALABRAS;
        }
    }
    