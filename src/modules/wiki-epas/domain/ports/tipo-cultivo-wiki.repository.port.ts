import { TipoCultivoWiki } from '../entities/tipo-cultivo-wiki.entity';

export interface TipoCultivoWikiRepositoryPort {
  guardar(tipoCultivo: TipoCultivoWiki): Promise<TipoCultivoWiki>;
  actualizar(id: number, tipoCultivo: TipoCultivoWiki): Promise<TipoCultivoWiki>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<TipoCultivoWiki | null>;
  listarTodos(): Promise<TipoCultivoWiki[]>;
}