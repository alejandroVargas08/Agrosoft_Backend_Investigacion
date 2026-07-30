import { Injectable } from "@nestjs/common";
import { actividadesRepositoryPort } from "../../domain/ports/actividades.repository.port";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { actividadesOrmEntity } from "./actividades.Orm-entity";
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
                subtipo: actividades.subtipo,
                loteId: actividades.loteId,
                subLoteId: actividades.subLoteId,
                cultivoId: actividades.cultivoId,
                fecha: actividades.fecha,
                horasActividad: actividades.horasActividad,
                precioHoraActividad: actividades.precioHoraActividad,
                costoManoObra: actividades.costoManoObra,
                descripcion: actividades.descripcion,
                estado: actividades.estado,
                creadoPorUsuarioId: actividades.creadoPorUsuarioId,
                cantidadPlantas: actividades.cantidadPlantas,
                kgRecolectados: actividades.kgRecolectados,
                productoAgroId: actividades.productoAgroId,
            });
            const saved = await this.repository.save(ormEntity);
            return this.toDomain(saved);
        }

        async buscarPorId(id: number): Promise<Actividades | null> {
            const ormEntity = await this.repository.findOne({ where: {id}});
            if (!ormEntity) return null;
            return this.toDomain(ormEntity);
        }

        async listarPorCultivo(cultivoId: number): Promise<Actividades[]> {
            const ormEntities = await this.repository.find({ where: {cultivoId}});
            return ormEntities.map((Entity) => this.toDomain(Entity));
        }

        async actualizar(actividad: Actividades): Promise<Actividades> {
            const ormEntity = this.repository.create(actividad);
            const update = await this.repository.save(ormEntity);
            return this.toDomain(update);
        }

        async eliminar(id: number): Promise<void> {
            await this.repository.delete(id);
        }

        private toDomain(ormEntity: actividadesOrmEntity): Actividades {
        return new Actividades(
            ormEntity.id,
            ormEntity.nombre,
            ormEntity.tipo,
            ormEntity.subtipo,
            ormEntity.loteId,
            ormEntity.subLoteId,
            ormEntity.cultivoId,
            ormEntity.fecha,
            ormEntity.horasActividad,
            ormEntity.precioHoraActividad,
            ormEntity.costoManoObra,
            ormEntity.descripcion,
            ormEntity.estado,
            ormEntity.creadoPorUsuarioId,
            ormEntity.cantidadPlantas,
            ormEntity.kgRecolectados,
            ormEntity.productoAgroId,
            );
        }
    }