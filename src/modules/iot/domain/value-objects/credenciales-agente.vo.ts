export class CredencialesAgente {
  private constructor(
    public readonly nombreUsuario: string,
    private readonly contrasena: string,
  ) {}

  static crear(nombreUsuario: string, contrasena: string): CredencialesAgente {
    if (!contrasena || contrasena.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }
    return new CredencialesAgente(nombreUsuario, contrasena);
  }

  // Solo la infraestructura (para conectarse de verdad al broker) puede pedir la contraseña real
  obtenerContrasenaReal(): string {
    return this.contrasena;
  }

  // Cualquier otro lugar del sistema (ej. una respuesta HTTP) usa esto en su lugar
  toJSON() {
    return { nombreUsuario: this.nombreUsuario, contrasena: '••••••••' };
  }
}