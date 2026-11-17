import { Captura } from '../entities/captura.entity';

export interface CapturaRepositoryPort {
  guardarVarias(capturas: Captura[]): Promise<Captura[]>;
  buscarPorClaves(vueloId: number, claves: string[]): Promise<Captura[]>;
  listarPorVuelo(vueloId: number): Promise<Captura[]>;
  contarPorVuelo(vueloId: number): Promise<number>;
}
