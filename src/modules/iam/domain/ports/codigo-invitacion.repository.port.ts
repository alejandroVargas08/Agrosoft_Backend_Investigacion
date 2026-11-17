import { CodigoInvitacion } from '../entities/codigo-invitacion.entity';

export interface CodigoInvitacionRepositoryPort {
    guardar(codigo: CodigoInvitacion): Promise<CodigoInvitacion>;
    buscarPorCodigo(codigo: string): Promise<CodigoInvitacion | null>;
    /** El codigo vivo de la ficha, si lo hay. */
    buscarVigenteDe(programaFormacionId: number): Promise<CodigoInvitacion | null>;
    /** Deja sin efecto los codigos anteriores de esa ficha. */
    anularDe(programaFormacionId: number): Promise<void>;
}
