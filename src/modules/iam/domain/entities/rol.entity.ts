export class Rol {
  private readonly id: string;
  private nombre: string;
  private descripcion: string;
  private activo: boolean;

  private constructor(
    id: string,
    nombre: string,
    descripcion: string,
    activo: boolean,
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activo = activo;
  }
  static crear (id: string, nombre: string, descripcion: string): Rol{
    if(!nombre || nombre.trim().length ===0) {
    throw new Error('El nombre del rol no puede estar vacío'); 
    };
    return new Rol(id, nombre.trim(), descripcion, true);
  }
}