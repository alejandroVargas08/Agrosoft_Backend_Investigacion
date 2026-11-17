import { UsuarioAutenticado } from '../value-objects/alcance-datos.vo';

export interface ContextoAccesoPort {
  obtener(usuarioId: number): Promise<UsuarioAutenticado | null>;
}
