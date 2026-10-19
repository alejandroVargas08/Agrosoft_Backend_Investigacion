/** Une un chat de Telegram con un usuario real de AgroSoft. */
export class VinculoUsuario {
    constructor(
        public readonly telegramUserId: string,
        public readonly usuarioId: number,
        public readonly nombre: string,
        public readonly correo: string,
        public readonly id: number | null = null,
    ) {}
}