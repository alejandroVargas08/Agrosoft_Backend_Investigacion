/** Los cuatro avisos que se pueden activar o apagar en Configuración. */
export type TipoAviso = 'alerta_sensor' | 'stock_bajo' | 'actividad_vencida' | 'incidencia';

export interface Aviso {
    tipo: TipoAviso;
    titulo: string;
    mensaje: string;
}

export interface PreferenciasNotificacion {
    alertasSensores: boolean;
    stockBajo: boolean;
    actividadesVencidas: boolean;
    nuevasIncidencias: boolean;
}

/** Sin fila guardada, todo llega: así lo muestra el diseño (todos encendidos). */
export const PREFERENCIAS_POR_DEFECTO: PreferenciasNotificacion = {
    alertasSensores: true,
    stockBajo: true,
    actividadesVencidas: true,
    nuevasIncidencias: true,
};

export const PREFERENCIA_DE: Record<TipoAviso, keyof PreferenciasNotificacion> = {
    alerta_sensor: 'alertasSensores',
    stock_bajo: 'stockBajo',
    actividad_vencida: 'actividadesVencidas',
    incidencia: 'nuevasIncidencias',
};

/**
 * Un medio por el que sale un aviso además de la campana de la app.
 * Telegram se registra solo cuando su módulo está encendido; así este módulo
 * no depende de Telegram.
 */
export interface CanalAviso {
    readonly nombre: string;
    enviar(usuarioId: number, aviso: Aviso): Promise<void>;
}
