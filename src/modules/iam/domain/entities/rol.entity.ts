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
  static crear (id: string)
}//Aqui quedamos en el rol