/**
 * Codigo de un solo uso para atar un chat de Telegram a una cuenta de AgroSoft
 * sin que la persona tenga que escribir su contrasena en el chat.
 *
 * La pantalla de Configuracion lo genera, la persona lo manda al bot con
 * /start <codigo> y el bot lo consume.
 */
export class CodigoVinculacion {
    constructor(
        public readonly codigo: string,
        public readonly usuarioId: number,
        public readonly expiraEn: Date,
        public readonly usadoEn: Date | null = null,
        public readonly id: number | null = null,
    ) {}

    estaVigente(ahora: Date = new Date()): boolean {
        return this.usadoEn === null && this.expiraEn.getTime() > ahora.getTime();
    }
}
