export interface TokenPayload {
    sub: number;      
    correo: string;
    rolId: number;
}

export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export interface TokenServicePort {
    generar(payload: TokenPayload): string;
}