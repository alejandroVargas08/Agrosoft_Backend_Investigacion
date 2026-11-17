import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { AlmacenamientoArchivosPort } from '../../domain/ports/almacenamiento-archivos.port';

@Injectable()
export class AlmacenamientoLocalAdapter implements AlmacenamientoArchivosPort {
  private readonly raiz = path.resolve(process.env.DRONES_STORAGE_DIR ?? 'storage/drones');

  async guardar(rutaTemporal: string, rutaDestino: string): Promise<string> {
    const destino = this.resolver(rutaDestino);
    await fs.mkdir(path.dirname(destino), { recursive: true });
    try {
      await fs.rename(rutaTemporal, destino);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
      await fs.copyFile(rutaTemporal, destino);
      await fs.rm(rutaTemporal, { force: true });
    }
    return rutaDestino;
  }

  async obtenerRutaLocal(ruta: string): Promise<string> {
    return this.resolver(ruta);
  }

  async eliminar(ruta: string): Promise<void> {
    await fs.rm(this.resolver(ruta), { force: true });
  }

  private resolver(ruta: string): string {
    const absoluta = path.resolve(this.raiz, ruta);
    if (!absoluta.startsWith(this.raiz + path.sep)) {
      throw new Error('Ruta de almacenamiento inválida');
    }
    return absoluta;
  }
}
