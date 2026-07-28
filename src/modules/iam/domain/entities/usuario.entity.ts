export type EstadoUsuario = 'activo' | 'inactivo' | 'suspendido';

export class Usuario {
  private constructor(
    private readonly id: number,
    private nombre: string,
    private apellido: string,
    private identificacion: string,
    private idFicha: string | null,
    private programaFormacionId: number | null,
    private telefono: string,
    private correo: string,
    private contrasenaHash: string,
    private correoVerificadoEn: Date | null,
    private estado: EstadoUsuario,
    private lastLoginAt: Date | null,
    private avatarUrl: string | null,
    private rolId: number,
    private readonly creadoEn: Date,
    private actualizadoEn: Date,
    private eliminadoEn: Date | null,
  ) {}

  static crear(props: {
    id: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    idFicha?: string;
    programaFormacionId?: number;
    telefono: string;
    correo: string;
    contrasenaHash: string;
    rolId: number;
  }): Usuario {
    if (!props.nombre || props.nombre.trim().length === 0) {
      throw new Error('El nombre no puede estar vacío');
    }
    if (!props.apellido || props.apellido.trim().length === 0) {
      throw new Error('El apellido no puede estar vacío');
    }
    if (!props.identificacion || props.identificacion.trim().length === 0) {
      throw new Error('La identificación no puede estar vacía');
    }
    if (!props.correo || !props.correo.includes('@')) {
      throw new Error('El correo no es válido');
    }
    if (!props.contrasenaHash) {
      throw new Error('La contraseña es obligatoria');
    }

    const ahora = new Date();

    return new Usuario(
      props.id,
      props.nombre.trim(),
      props.apellido.trim(),
      props.identificacion.trim(),
      props.idFicha ?? null,
      props.programaFormacionId ?? null,
      props.telefono,
      props.correo,
      props.contrasenaHash,
      null,
      'activo',
      null,
      null,
      props.rolId,
      ahora,
      ahora,
      null,
    );
  }

  static reconstruir(props: {
    id: number;
    nombre: string;
    apellido: string;
    identificacion: string;
    idFicha: string | null;
    programaFormacionId: number | null;
    telefono: string;
    correo: string;
    contrasenaHash: string;
    correoVerificadoEn: Date | null;
    estado: EstadoUsuario;
    lastLoginAt: Date | null;
    avatarUrl: string | null;
    rolId: number;
    creadoEn: Date;
    actualizadoEn: Date;
    eliminadoEn: Date | null;
  }): Usuario {
    return new Usuario(
      props.id,
      props.nombre,
      props.apellido,
      props.identificacion,
      props.idFicha,
      props.programaFormacionId,
      props.telefono,
      props.correo,
      props.contrasenaHash,
      props.correoVerificadoEn,
      props.estado,
      props.lastLoginAt,
      props.avatarUrl,
      props.rolId,
      props.creadoEn,
      props.actualizadoEn,
      props.eliminadoEn,
    );
  }

  obtenerId(): number { return this.id; }
  obtenerNombre(): string { return this.nombre; }
  obtenerApellido(): string { return this.apellido; }
  obtenerNombreCompleto(): string { return `${this.nombre} ${this.apellido}`; }
  obtenerIdentificacion(): string { return this.identificacion; }
  obtenerIdFicha(): string | null { return this.idFicha; }
  obtenerProgramaFormacionId(): number | null { return this.programaFormacionId; }
  obtenerTelefono(): string { return this.telefono; }
  obtenerCorreo(): string { return this.correo; }
  obtenerContrasenaHash(): string { return this.contrasenaHash; }
  obtenerCorreoVerificadoEn(): Date | null { return this.correoVerificadoEn; }
  obtenerEstado(): EstadoUsuario { return this.estado; }
  obtenerLastLoginAt(): Date | null { return this.lastLoginAt; }
  obtenerAvatarUrl(): string | null { return this.avatarUrl; }
  obtenerRolId(): number { return this.rolId; }
  obtenerCreadoEn(): Date { return this.creadoEn; }
  obtenerActualizadoEn(): Date { return this.actualizadoEn; }
  obtenerEliminadoEn(): Date | null { return this.eliminadoEn; }
  estaActivo(): boolean { return this.estado === 'activo' && this.eliminadoEn === null; }
  correoEstaVerificado(): boolean { return this.correoVerificadoEn !== null; }

  activar(): void {
    if (this.estado === 'activo') throw new Error('El usuario ya está activo');
    this.estado = 'activo';
    this.actualizadoEn = new Date();
  }

  desactivar(): void {
    if (this.estado === 'inactivo') throw new Error('El usuario ya está inactivo');
    this.estado = 'inactivo';
    this.actualizadoEn = new Date();
  }

  suspender(): void {
    if (this.estado === 'suspendido') throw new Error('El usuario ya está suspendido');
    this.estado = 'suspendido';
    this.actualizadoEn = new Date();
  }

  cambiarCorreo(nuevoCorreo: string): void {
    if (!nuevoCorreo || !nuevoCorreo.includes('@')) {
      throw new Error('El correo no es válido');
    }
    this.correo = nuevoCorreo;
    this.correoVerificadoEn = null;
    this.actualizadoEn = new Date();
  }

  verificarCorreo(): void {
    this.correoVerificadoEn = new Date();
    this.actualizadoEn = new Date();
  }

  cambiarContrasena(nuevoHash: string): void {
    if (!nuevoHash) throw new Error('El hash de contraseña no puede estar vacío');
    this.contrasenaHash = nuevoHash;
    this.actualizadoEn = new Date();
  }

  cambiarTelefono(nuevoTelefono: string): void {
    this.telefono = nuevoTelefono;
    this.actualizadoEn = new Date();
  }

  registrarLogin(): void {
    this.lastLoginAt = new Date();
  }

  cambiarAvatar(url: string | null): void {
    this.avatarUrl = url;
    this.actualizadoEn = new Date();
  }

  asignarRol(nuevoRolId: number): void {
    this.rolId = nuevoRolId;
    this.actualizadoEn = new Date();
  }

  asignarProgramaFormacion(programaFormacionId: number | null): void {
    this.programaFormacionId = programaFormacionId;
    this.actualizadoEn = new Date();
  }

  eliminar(): void {
    this.eliminadoEn = new Date();
    this.actualizadoEn = new Date();
  }
}