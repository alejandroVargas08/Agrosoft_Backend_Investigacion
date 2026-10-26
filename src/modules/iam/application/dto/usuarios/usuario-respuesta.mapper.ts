import { SolicitudRegistro, Usuario } from '../../../domain/entities/usuario.entity';

export interface UsuarioPublico {
  id: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  telefono: string;
  rolId: number;
  programaFormacionId: number | null;
  idFicha: string | null;
  estado: string;
  solicitud: SolicitudRegistro | null;
  ultimoIngreso: Date | null;
  creadoEn: Date;
}

export function aUsuarioPublico(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.obtenerId(),
    nombre: usuario.obtenerNombre(),
    apellido: usuario.obtenerApellido(),
    identificacion: usuario.obtenerIdentificacion(),
    correo: usuario.obtenerCorreo(),
    telefono: usuario.obtenerTelefono(),
    rolId: usuario.obtenerRolId(),
    programaFormacionId: usuario.obtenerProgramaFormacionId(),
    idFicha: usuario.obtenerIdFicha(),
    estado: usuario.obtenerEstado(),
    solicitud: usuario.obtenerSolicitudRegistro(),
    ultimoIngreso: usuario.obtenerLastLoginAt(),
    creadoEn: usuario.obtenerCreadoEn(),
  };
}
