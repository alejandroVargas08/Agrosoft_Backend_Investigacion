import { MensajeIA, RolMensajeIA } from '../entities/mensaje-ia.entity';

export interface MensajeIARepositoryPort {
  crear(props: {
    conversacionId: number; 
    rol: RolMensajeIA; 
    contenido: string;
    tieneImagenes?: boolean; 
    cantidadImagenes?: number;
  }): Promise<MensajeIA>;
  listarPorConversacion(conversacionId: number): Promise<MensajeIA[]>;
}