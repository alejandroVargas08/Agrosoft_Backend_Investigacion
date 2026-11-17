import { Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Autenticado } from '../../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../../iam/domain/value-objects/alcance-datos.vo';
import { GenerarCodigoVinculacionUseCase } from '../../application/use-cases/generar-codigo-vinculacion.use-case';
import { EstadoVinculacionUseCase } from '../../application/use-cases/estado-vinculacion.use-case';
import { DesvincularPorUsuarioUseCase } from '../../application/use-cases/desvincular-por-usuario.use-case';

/**
 * Lo que la pantalla de Configuracion necesita para vincular Telegram.
 * El codigo lo emite el servidor: antes el frontend lo inventaba con
 * Math.random() y el bot no tenia como reconocerlo.
 */
@Controller('telegram')
@Autenticado()
export class TelegramController {
    constructor(
        private readonly generarCodigo: GenerarCodigoVinculacionUseCase,
        private readonly estadoVinculacion: EstadoVinculacionUseCase,
        private readonly desvincularPorUsuario: DesvincularPorUsuarioUseCase,
    ) {}

    @Get('vinculacion')
    estado(@UsuarioActual() usuario: UsuarioAutenticado) {
        return this.estadoVinculacion.ejecutar(usuario.id);
    }

    @Post('vinculacion/codigo')
    async codigo(@UsuarioActual() usuario: UsuarioAutenticado) {
        const codigo = await this.generarCodigo.ejecutar(usuario.id);
        return { codigo: codigo.codigo, expiraEn: codigo.expiraEn };
    }

    @Delete('vinculacion')
    @HttpCode(HttpStatus.NO_CONTENT)
    async desvincular(@UsuarioActual() usuario: UsuarioAutenticado) {
        await this.desvincularPorUsuario.ejecutar(usuario.id);
    }
}
