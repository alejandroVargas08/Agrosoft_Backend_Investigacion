/**
 * Codigo con el que un aprendiz se registra y queda directamente en la ficha,
 * sin que el instructor tenga que pedirle el numero ni corregirlo despues.
 *
 * A diferencia del codigo de Telegram, este no es de un solo uso: lo usan
 * todos los aprendices de la ficha hasta que vence o el instructor lo cambia.
 */
export class CodigoInvitacion {
    constructor(
        public readonly codigo: string,
        public readonly programaFormacionId: number,
        public readonly expiraEn: Date,
        public readonly creadoPorId: number,
        public readonly anuladoEn: Date | null = null,
        public readonly id: number | null = null,
    ) {}

    estaVigente(ahora: Date = new Date()): boolean {
        return this.anuladoEn === null && this.expiraEn.getTime() > ahora.getTime();
    }
}
