import { Inject, Injectable } from '@nestjs/common';
import { Almacen } from '../../../domain/entities/almacen.entity';
import { ALMACEN_REPOSITORY_PORT } from '../../../domain/ports/almacen.repository.port';
import type { AlmacenRepositoryPort } from '../../../domain/ports/almacen.repository.port';
import { CrearAlmacenInput, AlmacenOutput } from '../../dto/catalogo.dto';

@Injectable()
export class CrearAlmacenUseCase {
    constructor(
        @Inject(ALMACEN_REPOSITORY_PORT)
        private readonly repo: AlmacenRepositoryPort,
    ) {}

    async ejecutar(input: CrearAlmacenInput): Promise<AlmacenOutput> {
        const almacen = Almacen.crear(input);
        const guardado = await this.repo.guardar(almacen);
        return {
        id: guardado.id as number,
        nombre: guardado.nombre,
        descripcion: guardado.descripcion,
        ubicacion: guardado.ubicacion,
        };
    }
}