import { PuntoGeografico } from './punto-geografico.vo';

export class PoligonoGeografico {
    private constructor(private readonly _vertices: PuntoGeografico[]) {}

static crear(vertices: PuntoGeografico[]): PoligonoGeografico {
    if (!vertices || vertices.length < 3) {
        throw new Error('Un polígono necesita al menos 3 vértices');
    }
    return new PoligonoGeografico([...vertices]);
}

    get vertices(): ReadonlyArray<PuntoGeografico> { return this._vertices; }

cantidadVertices(): number { return this._vertices.length; }
}