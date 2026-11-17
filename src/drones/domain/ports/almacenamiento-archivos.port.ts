export interface AlmacenamientoArchivosPort {
  guardar(rutaTemporal: string, rutaDestino: string): Promise<string>;
  obtenerRutaLocal(ruta: string): Promise<string>;
  eliminar(ruta: string): Promise<void>;
}
