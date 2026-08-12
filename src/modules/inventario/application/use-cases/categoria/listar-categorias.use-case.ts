import { Inject, Injectable } from '@nestjs/common';
import { CATEGORIA_REPOSITORY_PORT } from '../../../domain/ports/categoria.repository.port';
import type { CategoriaRepositoryPort } from '../../../domain/ports/categoria.repository.port';
import { CategoriaOutput } from '../../dto/catalogo.dto';

@Injectable()
export class ListarCategoriasUseCase {
    constructor(
        @Inject(CATEGORIA_REPOSITORY_PORT)
        private readonly repo: CategoriaRepositoryPort,
    ) {}

    async ejecutar(): Promise<CategoriaOutput[]> {
        const categorias = await this.repo.buscarTodos();
        return categorias.map((c) => ({
        id: c.id as number,
        nombre: c.nombre,
        descripcion: c.descripcion,
        tipoInsumo: c.tipoInsumo,
        }));
    }
}