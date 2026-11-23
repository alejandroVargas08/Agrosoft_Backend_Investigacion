import { Body, Controller, Get, Put } from '@nestjs/common';
import { IsBoolean, IsOptional } from 'class-validator';
import { Autenticado } from '../../../iam/infrastructure/http/decorators/autenticado.decorator';
import { UsuarioActual } from '../../../iam/infrastructure/http/decorators/usuario-actual.decorator';
import type { UsuarioAutenticado } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { PreferenciasService } from '../../application/preferencias.service';

export class GuardarPreferenciasDto {
    @IsOptional() @IsBoolean() alertasSensores?: boolean;
    @IsOptional() @IsBoolean() stockBajo?: boolean;
    @IsOptional() @IsBoolean() actividadesVencidas?: boolean;
    @IsOptional() @IsBoolean() nuevasIncidencias?: boolean;
}

/**
 * Los interruptores de Notificaciones en Configuración. Ruta propia y no
 * /notificaciones/preferencias: allá @Get(':usuarioId') la atraparía.
 */
@Controller('notificaciones-preferencias')
@Autenticado()
export class PreferenciasNotificacionController {
    constructor(private readonly preferencias: PreferenciasService) {}

    @Get()
    obtener(@UsuarioActual() usuario: UsuarioAutenticado) {
        return this.preferencias.obtener(usuario.id);
    }

    @Put()
    guardar(@Body() dto: GuardarPreferenciasDto, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.preferencias.guardar(usuario.id, dto);
    }
}
