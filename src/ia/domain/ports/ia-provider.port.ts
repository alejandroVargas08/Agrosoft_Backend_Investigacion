export interface IaProviderPort {
    chat(mensaje: string, contexto?: string): Promise<string>;
    analizarImagen(base64Image: string, prompt: string): Promise<string>;
}