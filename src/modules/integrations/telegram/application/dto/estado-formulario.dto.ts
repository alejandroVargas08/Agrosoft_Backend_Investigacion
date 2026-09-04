export interface IniciarConversacionInput {
    telegramUserId: string;
    primerStep: string;
    }

    export interface AvanzarConversacionInput {
    telegramUserId: string;
    siguienteStep: string;
    datosNuevos: Record<string, unknown>;
    }

    export interface EstadoFormularioOutput {
    telegramUserId: string;
    step: string;
    data: Record<string, unknown>;
    estado: string;
}