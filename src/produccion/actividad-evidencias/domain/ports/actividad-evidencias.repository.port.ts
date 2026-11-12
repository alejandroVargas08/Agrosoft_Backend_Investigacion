import { actividadEvidencia } from "../entities/actividad-evidencia.entity";

export const actividad_evidenciaRepository = Symbol('actividad_evidenciaRepository');
    export interface actividadEvidenciaRepositoryPort {
        crear(item: actividadEvidencia): Promise<actividadEvidencia>;
        buscarPorId(id: number): Promise<actividadEvidencia | null>;
        /** Con asignacionId trae solo las de esa entrega; sin el, todas. */
        listarPorActividad(actividadId: number, asignacionId?: number): Promise<actividadEvidencia[]>;
        actualizar(item: actividadEvidencia): Promise<actividadEvidencia>;
        eliminar(id: number): Promise<void>;
    } 