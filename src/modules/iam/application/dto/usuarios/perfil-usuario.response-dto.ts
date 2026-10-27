export class PerfilUsuarioResponseDto {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  /** Se llama `correo`, como en todo lo que sale de UsuarioPublico. */
  correo: string;
  telefono: string;
  estado: string;
  correoVerificado: boolean;
  rolId: number;
  /** El nombre del rol, para no obligar al frontend a resolverlo. */
  rol: string | null;
  programaFormacion: {
    nombre: string;
    tipo: string;
    ficha: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
  } | null;
}
