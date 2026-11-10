import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../domain/value-objects/alcance-datos.vo';
import { CodigoInvitacionUseCase } from '../../../application/use-cases/programa-formacion/codigo-invitacion.use-case';
import { Autenticado } from '../decorators/autenticado.decorator';
import { UsuarioActual } from '../decorators/usuario-actual.decorator';

/**
 * El codigo de invitacion de una ficha. No lleva permiso propio: quien tiene
 * la ficha a cargo puede verlo y cambiarlo, y el alcance de datos es el que
 * decide. Un administrador las ve todas porque su alcance es verTodo.
 */
@Controller('mis-fichas')
@Autenticado()
export class CodigoInvitacionController {
    constructor(private readonly codigos: CodigoInvitacionUseCase) {}

    @Get(':id/codigo-invitacion')
    obtener(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.codigos.obtener(id, usuario);
    }

    @Post(':id/codigo-invitacion')
    generar(@Param('id', ParseIntPipe) id: number, @UsuarioActual() usuario: UsuarioAutenticado) {
        return this.codigos.generar(id, usuario.id, usuario);
    }
}
