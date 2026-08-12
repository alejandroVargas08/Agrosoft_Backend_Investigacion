import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CrearReservaUseCase } from '../../application/use-cases/reserva/crear-reserva.use-case';
import { CancelarReservaUseCase } from '../../application/use-cases/reserva/cancelar-reserva.use-case';
import { ConfirmarReservaUseCase } from '../../application/use-cases/reserva/confirmar-reserva.use-case';
import { CrearReservaDto } from './dto/reserva-request.dto';

@Controller('inventario/reservas')
export class ReservaController {
    constructor(
        private readonly crearReserva: CrearReservaUseCase,
        private readonly cancelarReserva: CancelarReservaUseCase,
        private readonly confirmarReserva: ConfirmarReservaUseCase,
    ) {}

    @Post()
    crear(@Body() dto: CrearReservaDto) {
        return this.crearReserva.ejecutar({
        ...dto,
        fechaReserva: new Date(dto.fechaReserva),
        });
    }

    @Patch(':id/cancelar')
    cancelar(@Param('id', ParseIntPipe) id: number) {
        return this.cancelarReserva.ejecutar(id);
    }

    @Patch(':id/confirmar')
    confirmar(@Param('id', ParseIntPipe) id: number) {
        return this.confirmarReserva.ejecutar(id);
    }
}