import { Inject, Injectable } from '@nestjs/common';
import { ALMACEN_REPOSITORY_PORT } from '../../../domain/ports/almacen.repository.port';
import type { AlmacenRepositoryPort } from '../../../domain/ports/almacen.repository.port';
import { AlmacenOutput } from '../../dto/catalogo.dto';

@Injectable()
export class ListarAlmacenesUseCase {
    constructor(
        @Inject(ALMACEN_REPOSITORY_PORT)
        private readonly repo: AlmacenRepositoryPort,
    ) {}

    async ejecutar(): Promise<AlmacenOutput[]> {
        const almacenes = await this.repo.buscarTodos();
        return almacenes.map((a) => ({
        id: a.id as number,
        nombre: a.nombre,
        descripcion: a.descripcion,
        ubicacion: a.ubicacion,
        }));
    }
}