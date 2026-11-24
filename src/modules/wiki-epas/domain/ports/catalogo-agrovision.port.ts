// Catálogo público de AgroVisión (SENA Pitalito): fichas de enfermedades,
// plagas y deficiencias del café. https://agrovision.sbs/docs
export interface FichaAgroVision {
  id: string;
  clave: string;
  nombreComun: string;
  nombreCientifico: string | null;
  tipo: 'enfermedad' | 'plaga' | 'deficiencia' | 'sana' | string;
  cultivo: string | null;
  descripcion: string | null;
  sintomas: string | null;
  fotoUrl: string | null;
  avalada: boolean;
  medidasContencion: string | null;
  protocoloQuimico: string | null;
}

export interface CatalogoAgroVisionPort {
  listarFichas(): Promise<FichaAgroVision[]>;
}

export const CATALOGO_AGROVISION_TOKEN = 'CATALOGO_AGROVISION_TOKEN';
