export class Dinero {
    private constructor(private readonly _monto: number) {}

    static crear(monto: number): Dinero {
        if (monto === null || monto === undefined || Number.isNaN(monto)) {
        throw new Error('El monto es requerido');
        }
        if (monto < 0) {
        throw new Error('El monto no puede ser negativo');
        }
        return new Dinero(Math.round(monto * 100) / 100);
    }

    get monto(): number {
        return this._monto;
    }

    sumar(otro: Dinero): Dinero {
        return Dinero.crear(this._monto + otro.monto);
    }

    restar(otro: Dinero): Dinero {
        return Dinero.crear(this._monto - otro.monto);
    }

    multiplicarPor(factor: number): Dinero {
        return Dinero.crear(this._monto * factor);
    }
}