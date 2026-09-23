import { ConversacionIA } from '../entities/conversacion-ia.entity';

export interface ConversacionIARepositoryPort {
  crear(usuarioId: number, titulo: string): Promise<ConversacionIA>;
  listarPorUsuario(usuarioId: number): Promise<ConversacionIA[]>;
  buscarPorId(id: number): Promise<ConversacionIA | null>;
  guardar(conversacion: ConversacionIA): Promise<void>;
  eliminar(id: number): Promise<void>;
}