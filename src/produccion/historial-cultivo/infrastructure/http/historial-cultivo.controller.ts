import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { Autenticado } from "../../../../modules/iam/infrastructure/http/decorators/autenticado.decorator";
import { UsuarioActual } from "../../../../modules/iam/infrastructure/http/decorators/usuario-actual.decorator";
import type { UsuarioAutenticado } from "../../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { PERMISOS_PRODUCCION } from "../../../permisos-produccion";
import { AccesoCultivosService } from "../../../cultivos/application/services/acceso-cultivos.service";
import { listarHistorialCultivoUseCase } from "../../application/use-cases/listar-historial-cultivo.use-case";

@Controller('cultivos')
export class historialCultivoController {
    constructor(
        private readonly listarhistorialCultivoUC: listarHistorialCultivoUseCase,
        private readonly accesoCultivos: AccesoCultivosService,
    ) {}

    @Get(':id/historial')
    @Autenticado(PERMISOS_PRODUCCION.VER_CULTIVOS)
    async listarPorCultivo(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        await this.accesoCultivos.obtenerCultivoVisible(id, usuario);
        return this.listarhistorialCultivoUC.execute(id);
    }
}
