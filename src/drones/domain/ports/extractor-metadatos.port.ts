import { CalibracionBanda } from '../entities/captura.entity';

export interface MetadatosImagen {
  latitud: number | null;
  longitud: number | null;
  altitudRelativaM: number | null;
  inclinacionCamaraGrados: number | null;
  tomadaEn: Date | null;
  calibracion: CalibracionBanda;
}

export interface ExtractorMetadatosPort {
  extraer(rutaLocal: string): Promise<MetadatosImagen>;
}
