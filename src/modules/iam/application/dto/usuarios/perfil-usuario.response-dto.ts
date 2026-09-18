export class PerfilUsuarioResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rolId: number;
  programaFormacion: {
    nombre: string;
    tipo: string;
    ficha: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
  } | null;
}
