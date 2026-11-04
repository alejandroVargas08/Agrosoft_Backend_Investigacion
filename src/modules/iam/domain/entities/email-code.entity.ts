export enum TipoCodigo {
  VERIFICACION_EMAIL = 'verificacion_email',
  RESTABLECER_CONTRASENA = 'restablecer_contrasena',
  DOS_PASOS = 'dos_pasos',
}

export class EmailCode {
  constructor(
    public readonly id: number | null,
    public readonly email: string,
    public readonly codigo: string,
    public readonly tipo: TipoCodigo,
    public readonly expiraEn: Date,
    public readonly usado: boolean,
  ) {}

  estaExpirado(): boolean {
    return new Date() > this.expiraEn;
  }

  esValidoPara(tipo: TipoCodigo): boolean {
    return !this.usado && !this.estaExpirado() && this.tipo === tipo;
  }
}