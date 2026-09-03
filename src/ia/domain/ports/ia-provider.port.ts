export interface IaProviderPort {
    chat(mensaje: string, contexto?: string): Promise<string>;
}