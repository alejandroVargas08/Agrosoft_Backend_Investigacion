/**
 * Un flujo es un formulario conversacional: una lista de pasos que el bot
 * recorre uno por uno. El bot no sabe nada de incidencias ni de tratamientos:
 * solo sabe recorrer pasos. Agregar un comando nuevo es agregar un flujo.
 */

// De dónde salen las opciones cuando no están escritas a mano
export type FuenteOpciones = 'incidencias';

// Qué forma debe tener la respuesta para considerarse válida
export type FormatoPaso = 'numero' | 'fecha';

export interface OpcionPaso {
    etiqueta: string; // lo que ve el usuario en el botón
    valor: string;    // lo que se guarda
}

export interface PasoFlujo {
    campo: string;           // nombre del dato dentro de `data`
    pregunta: string;        // lo que el bot escribe
    opciones?: OpcionPaso[]; // botones fijos
    fuente?: FuenteOpciones; // botones que se consultan al preguntar
    formato?: FormatoPaso;   // si existe, la respuesta se valida antes de avanzar
    opcional?: boolean;      // si es true, el usuario puede responder "-"
}

export interface Flujo {
    comando: string; // sin la barra: 'incidencia'
    nombre: string;  // para los mensajes: 'Nueva incidencia'
    pasos: PasoFlujo[];
}