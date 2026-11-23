import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import type { CatalogoAgroVisionPort, FichaAgroVision } from '../../domain/ports/catalogo-agrovision.port';

const URL_POR_DEFECTO = 'https://agrovision.sbs/api/public/v1';

@Injectable()
export class AgroVisionAdapter implements CatalogoAgroVisionPort {
  private readonly base: string;

  constructor() {
    this.base = (process.env.AGROVISION_URL || URL_POR_DEFECTO).replace(/\/+$/, '');
  }

  async listarFichas(): Promise<FichaAgroVision[]> {
    try {
      const { data } = await axios.get<{ total: number; fichas: FichaAgroVision[] }>(`${this.base}/catalog`, { timeout: 15000 });
      return Array.isArray(data?.fichas) ? data.fichas : [];
    } catch {
      throw new ServiceUnavailableException('No se pudo consultar el catálogo de AgroVisión. Revisa la conexión a internet e intenta de nuevo.');
    }
  }
}
