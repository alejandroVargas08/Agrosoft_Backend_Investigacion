export class Coordenada {
  private constructor(
    public readonly latitud: number,
    public readonly longitud: number,
  ) {}

  static crear(latitud: number, longitud: number): Coordenada {
    if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      throw new Error('La latitud debe estar entre -90 y 90');
    }
    if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
      throw new Error('La longitud debe estar entre -180 y 180');
    }
    return new Coordenada(latitud, longitud);
  }

  static intentarCrear(latitud: number | null | undefined, longitud: number | null | undefined): Coordenada | null {
    if (latitud == null || longitud == null) return null;
    try {
      return Coordenada.crear(latitud, longitud);
    } catch {
      return null;
    }
  }
}
