import { Inject, Injectable } from '@nestjs/common';
import type { AlcanceDatos } from '../../../../modules/iam/domain/value-objects/alcance-datos.vo';
import { actividadHistorial } from '../../domain/entities/actividad-historial.entity';
import { actividad_HistorialRepository } from '../../domain/ports/actividad-historial.repository.port';
import { type actividadHistorialRepositoryPort } from '../../domain/ports/actividad-historial.repository.port';
import { AccesoActividadesService } from '../../../actividades/aplicattion/services/acceso-actividades.service';

const LIMITE_POR_DEFECTO = 200;

/**
 * El historial de todas las actividades que el usuario puede ver.
 *
 * Antes solo se podia consultar actividad por actividad, asi que la pantalla
 * obligaba a elegir lote, cultivo y actividad antes de mostrar nada.
 *
 * La visibilidad sale de AccesoActividadesService, el mismo que usan el
 * listado de actividades y el guard: asi el historial nunca muestra una
 * actividad que la pantalla de actividades esconderia.
 */
@Injectable()
export class ListarHistorialVisibleUseCase {
    constructor(
        @Inject(actividad_HistorialRepository)
        private readonly historialRepo: actividadHistorialRepositoryPort,
        private readonly accesoActividades: AccesoActividadesService,
    ) {}

    async ejecutar(alcance: AlcanceDatos, limite = LIMITE_POR_DEFECTO): Promise<actividadHistorial[]> {
        const actividades = await this.accesoActividades.listar(alcance);
        const ids = actividades.map((a) => a.id).filter((id): id is number => typeof id === 'number');

        return this.historialRepo.listarDeActividades(ids, limite);
    }
}
