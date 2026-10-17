import { AnalisisVuelo } from '../entities/analisis-vuelo.entity';

export interface AnalisisVueloRepositoryPort {
  guardar(analisis: AnalisisVuelo): Promise<AnalisisVuelo>;
  buscarPorId(id: number): Promise<AnalisisVuelo | null>;
  listarPorVuelo(vueloId: number): Promise<AnalisisVuelo[]>;
}
