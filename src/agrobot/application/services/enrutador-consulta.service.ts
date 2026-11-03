import { Injectable } from "@nestjs/common";
import { FuenteContexto } from "../../domain/ports/proveedor-contexto.port";

const PALABRAS: Record<FuenteContexto, RegExp>={
    sensores: /sensor|estaci[oó]n|temperatura|humedad|\buv\b|radiaci[oó]n|clima|alerta|hongo|calor|fr[ií]o/i,
    inventario:/insumo|inventario|stock|existencia|fertilizante|herramienta|se acaba|m[ií]nimo/i,
    drones:/dron|vuelo|ndvi|ndre|gndvi|ndwi|an[aá]lisis|estr[eé]s|cobertura|multiespectral|salud del (lote|cultivo)/i,
};
@Injectable()
    export class EnrutadorConsultasService{
        FuentesPara(mensaje: string): FuenteContexto[]{
            return(Object.keys(PALABRAS) as FuenteContexto[]).filter((fuente)=>PALABRAS[fuente].test(mensaje));
        }
    }
    