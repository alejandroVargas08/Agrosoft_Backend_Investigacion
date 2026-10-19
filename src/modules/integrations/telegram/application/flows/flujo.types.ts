
export interface OpcionPaso {
    etiqueta: string; // lo que ve el usuario en el botón
    valor: string;    // lo que se guarda
}

export interface PasoFlujo {
    campo: string;           // nombre del dato dentro de `data`
    pregunta: string;        // lo que el bot escribe
    opciones?: OpcionPaso[]; // si existe, se muestran botones en vez de texto libre
    opcional?: boolean;      // si es true, el usuario puede responder "-"
}

export interface Flujo {
    comando: string; // sin la barra: 'incidencia'
    nombre: string;  // para los mensajes: 'Nueva incidencia'
    pasos: PasoFlujo[];
}