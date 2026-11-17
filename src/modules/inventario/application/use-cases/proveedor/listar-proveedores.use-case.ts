import { Inject, Injectable } from '@nestjs/common';
import { PROVEEDOR_REPOSITORY_PORT } from '../../../domain/ports/proveedor.repository.port';
import type { ProveedorRepositoryPort } from '../../../domain/ports/proveedor.repository.port';
import { ProveedorOutput } from '../../dto/catalogo.dto';

@Injectable()
export class ListarProveedoresUseCase {
    constructor(
        @Inject(PROVEEDOR_REPOSITORY_PORT)
        private readonly repo: ProveedorRepositoryPort,
    ) {}

    async ejecutar(): Promise<ProveedorOutput[]> {
        const proveedores = await this.repo.buscarTodos();
        return proveedores.map((p) => ({ id: p.id as number, nombre: p.nombre }));
    }
}