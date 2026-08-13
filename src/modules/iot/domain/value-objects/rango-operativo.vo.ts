export class RangoOperativo {
  private constructor(
    public readonly minimo: number,
    public readonly maximo: number,
  ) {}

  static crear(minimo: number, maximo: number): RangoOperativo {
    if (minimo >= maximo) {
      throw new Error('El valor mínimo debe ser menor que el valor máximo');
    }
    return new RangoOperativo(minimo, maximo);
  }
}