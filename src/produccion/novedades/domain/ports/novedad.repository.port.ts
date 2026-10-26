import { EstadoNovedad, Novedad } from '../entities/novedad.entity';

export const NOVEDAD_REPOSITORY = Symbol('NOVEDAD_REPOSITORY');

export interface NovedadRepositoryPort {
    crear(novedad: Novedad): Promise<Novedad>;
    buscarPorId(id: number): Promise<Novedad | null>;
    /** Las de un aprendiz. Para la pantalla "Mis novedades". */
    listarPorAutor(usuarioId: number, estados?: EstadoNovedad[]): Promise<Novedad[]>;
    /** Las de un grupo de aprendices, en una sola consulta. Para el instructor. */
    listarPorAutores(usuarioIds: number[], estados?: EstadoNovedad[]): Promise<Novedad[]>;
    actualizar(novedad: Novedad): Promise<Novedad>;
    eliminar(id: number): Promise<void>;
}
