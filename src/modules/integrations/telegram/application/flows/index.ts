import { Flujo } from './flujo.types';
import { FLUJO_INCIDENCIA } from './incidencia.flujo';

// El registro de flujos disponibles. Agregar un comando = agregarlo aquí.
export const FLUJOS: Flujo[] = [FLUJO_INCIDENCIA];

export const buscarFlujo = (comando: string): Flujo | undefined =>
    FLUJOS.find((flujo) => flujo.comando === comando);

export * from './flujo.types';