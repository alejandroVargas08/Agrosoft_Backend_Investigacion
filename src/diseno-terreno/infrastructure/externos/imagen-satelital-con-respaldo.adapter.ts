import { Logger } from '@nestjs/common';
import type { ImagenSatelital, ProveedorImagenSatelitalPort } from '../../domain/ports/proveedores-geo.port';
import type { PuntoGeo } from '../../domain/value-objects/geo';

/**
 * Intenta Google Static Maps y, si falla (403 por una clave sin la Static API,
 * cuota agotada, sin red...), usa Esri World Imagery, que no pide clave.
 */
export class ImagenSatelitalConRespaldoAdapter implements ProveedorImagenSatelitalPort {
  private readonly logger = new Logger('ImagenSatelital');

  constructor(
    private readonly principal: ProveedorImagenSatelitalPort,
    private readonly respaldo: ProveedorImagenSatelitalPort,
  ) {}

  disponible(): boolean {
    return this.principal.disponible() || this.respaldo.disponible();
  }

  async obtenerImagen(poligono: PuntoGeo[]): Promise<ImagenSatelital> {
    try {
      return await this.principal.obtenerImagen(poligono);
    } catch (error) {
      this.logger.warn(`Google Static Maps falló (${(error as Error)?.message ?? error}); se usa Esri World Imagery`);
      return this.respaldo.obtenerImagen(poligono);
    }
  }
}
