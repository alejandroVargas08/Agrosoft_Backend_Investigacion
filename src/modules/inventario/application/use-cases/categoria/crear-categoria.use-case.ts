import { Inject, Injectable } from '@nestjs/common';
import { Categoria } from '../../../domain/entities/categoria.entity';
import { CATEGORIA_REPOSITORY_PORT } from '../../../domain/ports/categoria.repository.port';
import type { CategoriaRepositoryPort } from '../../../domain/ports/categoria.repository.port';
import { CrearCategoriaInput, CategoriaOutput } from '../../dto/catalogo.dto';

@Injectable()
export class CrearCategoriaUseCase {
    constructor(
        @Inject(CATEGORIA_REPOSITORY_PORT)
        private readonly repo: CategoriaRepositoryPort,
    ) {}

    async ejecutar(input: CrearCategoriaInput): Promise<CategoriaOutput> {
        const categoria = Categoria.crear(input);
        const guardado = await this.repo.guardar(categoria);
        return {
        id: guardado.id as number,
        nombre: guardado.nombre,
        descripcion: guardado.descripcion,
        tipoInsumo: guardado.tipoInsumo,
        };
    }
}