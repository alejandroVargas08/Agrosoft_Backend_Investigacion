import { Inject, Injectable } from "@nestjs/common";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository } from "../../domain/ports/cultivo.repository.port";
import { type CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { AccesoCultivosService } from "../services/acceso-cultivos.service";
import { registrarCambioHistorialCultivoUseCase } from "../../../historial-cultivo/application/use-cases/registrar-historial-cultivo.use-case";

@Injectable()
export class finalizarCultivoUseCase {
    constructor(
        @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort,
        private readonly accesoCultivos: AccesoCultivosService,
        private readonly registrarHistorial: registrarCambioHistorialCultivoUseCase,
    ) {}

    async ejecutar(id: number, fechaFinalizacion: Date, usuario: UsuarioAutenticado): Promise<Cultivo> {
        const cultivo = await this.accesoCultivos.obtenerCultivoVisible(id, usuario);
        const estadoAntes = cultivo.estado;
        cultivo.finalizar(fechaFinalizacion);
        const guardado = await this.cultivoRepo.actualizar(cultivo);

        await this.registrarHistorial.execute({
            cultivoId: id,
            usuarioId: usuario.id,
            motivo: 'Unidad finalizada',
            cambios: { estado: { antes: estadoAntes, despues: cultivo.estado } },
        });
        return guardado;
    }
}
