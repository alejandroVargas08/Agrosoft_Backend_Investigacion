import { Inject, Injectable } from '@nestjs/common';
import { Proveedor } from '../../../domain/entities/proveedor.entity';
import { PROVEEDOR_REPOSITORY_PORT } from '../../../domain/ports/proveedor.repository.port';
import type { ProveedorRepositoryPort } from '../../../domain/ports/proveedor.repository.port';
import { CrearProveedorInput, ProveedorOutput } from '../../dto/catalogo.dto';

@Injectable()
export class CrearProveedorUseCase {
    constructor(
        @Inject(PROVEEDOR_REPOSITORY_PORT)
        private readonly repo: ProveedorRepositoryPort,
    ) {}

    async ejecutar(input: CrearProveedorInput): Promise<ProveedorOutput> {
        const proveedor = Proveedor.crear(input);
        const guardado = await this.repo.guardar(proveedor);
        return { id: guardado.id as number, nombre: guardado.nombre };
    }
}