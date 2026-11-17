export class UsuarioRespuestaDto {
  readonly id: number;
  readonly nombre: string;
  readonly apellido: string;
  readonly identificacion: string;
  readonly correo: string;
  readonly telefono: string;
  readonly rolId: number;
  readonly programaFormacion?: {
    readonly nombre: string;
    readonly tipo: string;
    readonly ficha: string;
    readonly fechaInicio: Date | string;
    readonly fechaFin: Date | string;
    readonly estado: string;
  } | null;
}