import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';

export interface AccesoLotesPort {
    puedeAcceder(alcance: AlcanceDatos, loteId: number): Promise<boolean>;
    idsAccesibles(alcance: AlcanceDatos): Promise<number[] | null>;
}

export const ACCESO_LOTES_PORT = Symbol('ACCESO_LOTES_PORT');
