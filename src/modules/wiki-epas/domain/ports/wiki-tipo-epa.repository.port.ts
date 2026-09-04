import { WikiTipoEpa } from '../entities/wiki-tipo-epa.entity';

export interface WikiTipoEpaRepositoryPort {
  guardar(tipoEpa: WikiTipoEpa): Promise<WikiTipoEpa>;
  actualizar(id: number, tipoEpa: WikiTipoEpa): Promise<WikiTipoEpa>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<WikiTipoEpa | null>;
  listarTodos(): Promise<WikiTipoEpa[]>;
}