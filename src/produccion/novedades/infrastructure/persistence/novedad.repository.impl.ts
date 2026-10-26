import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import {
    EstadoNovedad,
    Novedad,
    TipoNovedad,
    UrgenciaNovedad,
} from '../../domain/entities/novedad.entity';
import { NovedadRepositoryPort } from '../../domain/ports/novedad.repository.port';
import { NovedadOrmEntity } from './novedad.orm-entity';

@Injectable()
export class NovedadRepositoryImpl implements NovedadRepositoryPort {
    constructor(
        @InjectRepository(NovedadOrmEntity)
        private readonly repo: Repository<NovedadOrmEntity>,
    ) {}

    async crear(novedad: Novedad): Promise<Novedad> {
        const guardada = await this.repo.save(this.repo.create(this.aOrm(novedad)));
        return this.aDominio(guardada);
    }

    async buscarPorId(id: number): Promise<Novedad | null> {
        const fila = await this.repo.findOneBy({ id });
        return fila ? this.aDominio(fila) : null;
    }

    async listarPorAutor(usuarioId: number, estados?: EstadoNovedad[]): Promise<Novedad[]> {
        return this.listar({ reportadaPorUsuarioId: usuarioId }, estados);
    }

    async listarPorAutores(usuarioIds: number[], estados?: EstadoNovedad[]): Promise<Novedad[]> {
        if (usuarioIds.length === 0) return [];
        return this.listar({ reportadaPorUsuarioId: In(usuarioIds) }, estados);
    }

    async actualizar(novedad: Novedad): Promise<Novedad> {
        if (novedad.id === null) throw new Error('No se puede actualizar una novedad sin id');
        await this.repo.update(novedad.id, this.aOrm(novedad));
        const fila = await this.repo.findOneBy({ id: novedad.id });
        return this.aDominio(fila!);
    }

    async eliminar(id: number): Promise<void> {
        await this.repo.softDelete(id);
    }

    private async listar(
        filtro: FindOptionsWhere<NovedadOrmEntity>,
        estados?: EstadoNovedad[],
    ): Promise<Novedad[]> {
        const where: FindOptionsWhere<NovedadOrmEntity> =
            estados && estados.length > 0 ? { ...filtro, estado: In(estados) } : filtro;

        // Las pendientes primero, y dentro de cada grupo lo más reciente arriba
        const filas = await this.repo.find({ where, order: { estado: 'ASC', id: 'DESC' } });
        return filas.map((fila) => this.aDominio(fila));
    }

    private aDominio(fila: NovedadOrmEntity): Novedad {
        return new Novedad(
            fila.id,
            fila.tipo as TipoNovedad,
            fila.urgencia as UrgenciaNovedad,
            fila.estado as EstadoNovedad,
            fila.descripcion,
            fila.reportadaPorUsuarioId,
            fila.actividadId ?? null,
            fila.insumoId ?? null,
            fila.nombreHerramienta ?? null,
            fila.respuestaInstructor ?? null,
            fila.respondidaPorUsuarioId ?? null,
            fila.respondidaEn ?? null,
            fila.createdAt,
        );
    }

    private aOrm(n: Novedad): Partial<NovedadOrmEntity> {
        return {
            tipo: n.tipo,
            urgencia: n.urgencia,
            estado: n.estado,
            descripcion: n.descripcion,
            reportadaPorUsuarioId: n.reportadaPorUsuarioId,
            actividadId: n.actividadId,
            insumoId: n.insumoId,
            nombreHerramienta: n.nombreHerramienta,
            respuestaInstructor: n.respuestaInstructor,
            respondidaPorUsuarioId: n.respondidaPorUsuarioId,
            respondidaEn: n.respondidaEn,
        };
    }
}
