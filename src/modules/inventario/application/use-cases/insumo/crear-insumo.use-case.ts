import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoInsumo, Insumo } from '../../../domain/entities/insumo.entity';
import { INSUMO_REPOSITORY_PORT } from '../../../domain/ports/insumo.repository.port';
import type { InsumoRepositoryPort } from '../../../domain/ports/insumo.repository.port';
import { ALMACEN_REPOSITORY_PORT } from '../../../domain/ports/almacen.repository.port';
import type { AlmacenRepositoryPort } from '../../../domain/ports/almacen.repository.port';
import { PROVEEDOR_REPOSITORY_PORT } from '../../../domain/ports/proveedor.repository.port';
import type { ProveedorRepositoryPort } from '../../../domain/ports/proveedor.repository.port';
import { CATEGORIA_REPOSITORY_PORT } from '../../../domain/ports/categoria.repository.port';
import type { CategoriaRepositoryPort } from '../../../domain/ports/categoria.repository.port';
import { CrearInsumoInput, InsumoOutput, toInsumoOutput } from '../../dto/insumo.dto';

@Injectable()
export class CrearInsumoUseCase {
    constructor(
        @Inject(INSUMO_REPOSITORY_PORT) private readonly insumoRepo: InsumoRepositoryPort,
        @Inject(ALMACEN_REPOSITORY_PORT) private readonly almacenRepo: AlmacenRepositoryPort,
        @Inject(PROVEEDOR_REPOSITORY_PORT) private readonly proveedorRepo: ProveedorRepositoryPort,
        @Inject(CATEGORIA_REPOSITORY_PORT) private readonly categoriaRepo: CategoriaRepositoryPort,
    ) {}

    async ejecutar(input: CrearInsumoInput): Promise<InsumoOutput> {
        const [existeAlmacen, existeProveedor, existeCategoria] = await Promise.all([
        this.almacenRepo.existePorId(input.almacenId),
        this.proveedorRepo.existePorId(input.proveedorId),
        this.categoriaRepo.existePorId(input.categoriaId),
        ]);
        if (!existeAlmacen) throw new NotFoundException(`No existe el almacén con id ${input.almacenId}`);
        if (!existeProveedor) throw new NotFoundException(`No existe el proveedor con id ${input.proveedorId}`);
        if (!existeCategoria) throw new NotFoundException(`No existe la categoría con id ${input.categoriaId}`);

        const insumo = Insumo.crear({ ...input, estado: EstadoInsumo.ACTIVO });
        const guardado = await this.insumoRepo.guardar(insumo);
        return toInsumoOutput(guardado);
    }
}