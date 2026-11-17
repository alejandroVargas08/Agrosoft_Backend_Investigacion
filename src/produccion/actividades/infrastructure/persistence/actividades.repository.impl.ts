import { Injectable } from "@nestjs/common";
import { actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { actividadesOrmEntity } from "./actividades.orm-entity";
import { Actividades } from "../../domain/entities/actividades.entity";

@Injectable()
export class actividadesRepositoryImpl implements actividadesRepositoryPort {
    constructor(
        @InjectRepository(actividadesOrmEntity)
        private readonly repository: Repository<actividadesOrmEntity>,
    ) {}

    async crear(actividades: Actividades): Promise<Actividades> {
        const ormEntity = this.repository.create({
            nombre: actividades.nombre,
            tipo: actividades.tipo,
            subtipo: actividades.subtipo ?? undefined,
            loteId: actividades.loteId,
            subLoteId: actividades.subLoteId ?? undefined,
            cultivoId: actividades.cultivoId,
            fecha: actividades.fecha,
            horasActividad: actividades.horasActividad,
            precioHoraActividad: actividades.precioHoraActividad,
            costoManoObra: actividades.costoManoObra,
            descripcion: actividades.descripcion,
            estado: actividades.estado,
            creadoPorUsuarioId: actividades.creadoPorUsuarioId,
            cantidadPlantas: actividades.cantidadPlantas ?? undefined,
            kgRecolectados: actividades.kgRecolectados ?? undefined,
            productoAgroId: actividades.productoAgroId ?? undefined,
        });
        const saved = await this.repository.save(ormEntity);
        return this.toDomain(saved);
    }

    async buscarPorId(id: number): Promise<Actividades | null> {
        const ormEntity = await this.repository.findOne({ where: { id } });
        if (!ormEntity) return null;
        return this.toDomain(ormEntity);
    }

    async listarPorCultivo(cultivoId: number): Promise<Actividades[]> {
        const ormEntities = await this.repository.find({ where: { cultivoId } });
        return ormEntities.map((entity) => this.toDomain(entity));
    }

    async listarVisibles(loteIdsPermitidos: number[] | null, cultivoId?: number): Promise<Actividades[]> {
        const ormEntities = await this.repository.find({
            where: this.filtroVisibles(loteIdsPermitidos, cultivoId),
            order: { fecha: 'DESC', id: 'DESC' },
        });
        return ormEntities.map((entity) => this.toDomain(entity));
    }

    // loteIdsPermitidos en null significa "ve todo"; un arreglo vacio, que no ve nada
    private filtroVisibles(
        loteIdsPermitidos: number[] | null,
        cultivoId?: number,
    ): FindOptionsWhere<actividadesOrmEntity> {
        const filtro: FindOptionsWhere<actividadesOrmEntity> = {};
        if (cultivoId !== undefined) filtro.cultivoId = cultivoId;
        if (loteIdsPermitidos !== null) filtro.loteId = In(loteIdsPermitidos);
        return filtro;
    }

    async actualizar(actividad: Actividades): Promise<Actividades> {
        const ormEntity = await this.repository.preload({
            id: actividad.id ?? undefined,
            nombre: actividad.nombre,
            tipo: actividad.tipo,
            subtipo: actividad.subtipo ?? undefined,
            loteId: actividad.loteId,
            subLoteId: actividad.subLoteId ?? undefined,
            cultivoId: actividad.cultivoId,
            fecha: actividad.fecha,
            horasActividad: actividad.horasActividad,
            precioHoraActividad: actividad.precioHoraActividad,
            costoManoObra: actividad.costoManoObra,
            descripcion: actividad.descripcion,
            estado: actividad.estado,
            creadoPorUsuarioId: actividad.creadoPorUsuarioId,
            cantidadPlantas: actividad.cantidadPlantas ?? undefined,
            kgRecolectados: actividad.kgRecolectados ?? undefined,
            productoAgroId: actividad.productoAgroId ?? undefined,
        });

        if (!ormEntity) {
            throw new Error(`Actividad con ID ${actividad.id} no encontrada para actualizar`);
        }

        const updated = await this.repository.save(ormEntity);
        return this.toDomain(updated);
    }

    async eliminar(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    private toDomain(ormEntity: actividadesOrmEntity): Actividades {
        return new Actividades(
            ormEntity.id,
            ormEntity.nombre,
            ormEntity.tipo,
            ormEntity.subtipo ?? null,
            ormEntity.loteId,
            ormEntity.subLoteId ?? null,
            ormEntity.cultivoId,
            ormEntity.fecha,
            ormEntity.horasActividad,
            ormEntity.precioHoraActividad,
            ormEntity.costoManoObra,
            ormEntity.descripcion,
            ormEntity.estado,
            ormEntity.creadoPorUsuarioId,
            ormEntity.cantidadPlantas ?? null,
            ormEntity.kgRecolectados ?? null,
            ormEntity.productoAgroId ?? null,
        );
    }
}