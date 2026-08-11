export class PuntoGeografico {
    private constructor(
        private readonly _lat: number,
        private readonly _lng: number,
) {}

static crear(lat: number, lng: number): PuntoGeografico {
    if (lat < -90 || lat > 90) {
        throw new Error('Latitud fuera de rango (-90 a 90)');
    }
    if (lng < -180 || lng > 180) {
        throw new Error('Longitud fuera de rango (-180 a 180)');
    }
    return new PuntoGeografico(lat, lng);
}

get lat(): number { return this._lat; }
get lng(): number { return this._lng; }

equals(otro: PuntoGeografico): boolean {
    return otro instanceof PuntoGeografico && otro.lat === this._lat && otro.lng === this._lng;
}
}