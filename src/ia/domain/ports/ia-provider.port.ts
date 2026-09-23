export interface IaProviderPort {
    chat(mensaje: string, contexto?: string): Promise<string>;
    analizarImagenes(base64Images: string[], prompt: string): Promise<string>;
}