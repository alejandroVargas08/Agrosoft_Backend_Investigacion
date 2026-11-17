import { Vuelo } from '../entities/vuelo.entity';

export interface FiltrosVuelo {
  loteId?: number;
  dronId?: number;
  loteIds?: number[];
}

export interface VueloRepositoryPort {
  guardar(vuelo: Vuelo): Promise<Vuelo>;
  eliminar(id: number): Promise<void>;
  buscarPorId(id: number): Promise<Vuelo | null>;
  listar(filtros?: FiltrosVuelo): Promise<Vuelo[]>;
}
