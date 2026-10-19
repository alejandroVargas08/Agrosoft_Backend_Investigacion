import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ActividadAsignacion, EstadoAsignacion } from "../../domain/entities/actividad-asignacion.entity";
import { ActividadAsignacionesRepositoryPort } from "../../domain/ports/actividad-asignaciones.repository.port";
import { ActividadAsignacionOrmEntity } from "./actividad-asignacion.orm-entity";

@Injectable()
export class ActividadAsignacionesRepositoryImpl implements ActividadAsignacionesRepositoryPort {
    constructor(
        @InjectRepository(ActividadAsignacionOrmEntity)
        private readonly repo: Repository<ActividadAsignacionOrmEntity>,
    ) {}

    async guardar(asignacion: ActividadAsignacion): Promise<ActividadAsignacion> {
        const props = asignacion.toProps();
        const guardado = await this.repo.save(this.repo.create({
            ...(props.id ? { id: props.id } : {}),
            actividadId: props.actividadId,
            aprendizId: props.aprendizId,
            asignadoPorId: props.asignadoPorId,
            estado: props.estado,
            fechaLimite: props.fechaLimite,
            horasTrabajadas: props.horasTrabajadas,
            comentarioAprendiz: props.comentarioAprendiz,
            comentarioInstructor: props.comentarioInstructor,
            iniciadaEn: props.iniciadaEn,
            entregadaEn: props.entregadaEn,
            revisadaEn: props.revisadaEn,
            revisadaPorId: props.revisadaPorId,
        }));
        return this.aDominio(guardado);
    }

    async buscarPorId(id: number): Promise<ActividadAsignacion | null> {
        const fila = await this.repo.findOne({ where: { id } });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarPorActividadYAprendiz(actividadId: number, aprendizId: number): Promise<ActividadAsignacion | null> {
        const fila = await this.repo.findOne({ where: { actividadId, aprendizId } });
        return fila ? this.aDominio(fila) : null;
    }

    async listarPorActividad(actividadId: number): Promise<ActividadAsignacion[]> {
        const filas = await this.repo.find({ where: { actividadId }, order: { id: 'ASC' } });
        return filas.map((fila) => this.aDominio(fila));
    }

    async listarPorAprendiz(aprendizId: number, estados?: EstadoAsignacion[]): Promise<ActividadAsignacion[]> {
        const filas = await this.repo.find({
            where: estados && estados.length > 0 ? { aprendizId, estado: In(estados) } : { aprendizId },
            order: { fechaLimite: 'ASC', id: 'DESC' },
        });
        return filas.map((fila) => this.aDominio(fila));
    }

    async listarPorEstado(estado: EstadoAsignacion): Promise<ActividadAsignacion[]> {
        const filas = await this.repo.find({ where: { estado }, order: { entregadaEn: 'ASC' } });
        return filas.map((fila) => this.aDominio(fila));
    }

    async eliminar(id: number): Promise<void> {
        await this.repo.softDelete(id);
    }

    private aDominio(fila: ActividadAsignacionOrmEntity): ActividadAsignacion {
        return ActividadAsignacion.desdePersistencia({
            id: fila.id,
            actividadId: fila.actividadId,
            aprendizId: fila.aprendizId,
            asignadoPorId: fila.asignadoPorId,
            estado: fila.estado as EstadoAsignacion,
            fechaLimite: fila.fechaLimite,
            horasTrabajadas: fila.horasTrabajadas,
            comentarioAprendiz: fila.comentarioAprendiz,
            comentarioInstructor: fila.comentarioInstructor,
            iniciadaEn: fila.iniciadaEn,
            entregadaEn: fila.entregadaEn,
            revisadaEn: fila.revisadaEn,
            revisadaPorId: fila.revisadaPorId,
            creadoEn: fila.creadoEn,
        });
    }
}
