import { Categoria } from '../entities/categoria.entity';

export interface CategoriaRepositoryPort {
    buscarPorId(id: number): Promise<Categoria | null>;
    buscarTodos(): Promise<Categoria[]>;
    guardar(categoria: Categoria): Promise<Categoria>;
    existePorId(id: number): Promise<boolean>;
    }

export const CATEGORIA_REPOSITORY_PORT = Symbol('CATEGORIA_REPOSITORY_PORT');