import { Inject, Injectable } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PROVEEDORES_CONTEXTO_TOKEN } from "../../domain/ports/proveedor-contexto.port";
import type { ProveedorContextoPort } from "../../domain/ports/proveedor-contexto.port";
import { EnrutadorConsultasService } from "./enrutador-consulta.service";

const REGLAS_CON_DATOS =
    'REGLAS PARA ESTAS RESPUESTAS= responde unicamente con los datos de AgroSoft que aparecen abajo.'+ 'Si el usuario o aprendiz pide un dato que no aparece, di "No tengo ese dato aún" y no lo inventes.' + 'Los unicos sensores del sistema son temperatura del aire (°C) y humedad relativa (%) con DHT22, e índice UV con UVM-30A.' + 'Cita los valores y la hora de lectura. Si un valor está fuera del rango normal, dilo y explica el riesgo para el cultivo en palabras sencillas. ' + 'Separa lo que es dato medido de lo que es recomendación general.';

const REGLAS_SIN_DATOS =
    'REGLAS PARA ESTA RESPUESTA: en este mensaje no se consultaron datos de la finca.' + 'No inventes valores de sensores, inventario ni vuelos de dron. ' + 'Si el usuario pide datos de la finca, pídele que diga qué quiere consultar (sensores, inventario o dron).';

@Injectable()
    export class ConstructorContextoService{
        constructor(
            private readonly enrutador: EnrutadorConsultasService,
            @Inject(PROVEEDORES_CONTEXTO_TOKEN) private readonly proveedores: ProveedorContextoPort[],
        ){}
        async construir (mensaje: string, usuario: UsuarioAutenticado): Promise<string>{
            const fuentes = this.enrutador.FuentesPara(mensaje);
            if(fuentes.length === 0) return REGLAS_SIN_DATOS;

            const bloques = await Promise.all(
                this.proveedores
                .filter((proveedor)=> fuentes.includes(proveedor.fuente))
                .map((proveedor)=>
                proveedor.obtener(usuario).catch(()=> `${proveedor.fuente.toUpperCase()}: No se pudo consultar en este momento`),
                ),
            );
            return [REGLAS_CON_DATOS, 'Datos actuales de AgroSoft:', ...bloques].join('\n\n');
        }

    }
    