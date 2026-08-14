import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { reservarActividadInsumoReservaUseCase } from "../../application/use-cases/reservar-actividad-insumo-reserva.use-case";
import { listarActividadInsumoReservaUseCase } from "../../application/use-cases/listar-actividad-insumo-reserva.use-case";
import { ajustarActividadInsumoReservaDto } from "../../application/dto/ajustar-actividad-insumo-reserva.dto";
import { liberarActividadInsumoReservaUseCase } from "../../application/use-cases/liberar-actividad-insumo-reserva.use-case";
import { reservaActividadInsumoDto } from "../../application/dto/reservar-actividad-insumo-reserva.dto";
import { ajustarCantidadActividadInsumoReservaUseCase } from "../../application/use-cases/ajustar-cantidad-actividad-insumo-reserva.use-case";

@Controller('actividad/:actividadId/insumoReserva')
    export class actividadInsumoReservaController {
        constructor(
            private readonly reservaInsumoUC: reservarActividadInsumoReservaUseCase,
            private readonly listarReservaUC: listarActividadInsumoReservaUseCase,
            private readonly ajustarCantidadUC: ajustarCantidadActividadInsumoReservaUseCase,
            private readonly liberarReservaUC: liberarActividadInsumoReservaUseCase,
        ) {}

        @Post()
        reservar(@Param('actividadId', ParseIntPipe) actividadId: number, @Body() dto: reservaActividadInsumoDto) {
            return this.reservaInsumoUC.ejecutar(actividadId, dto);
        }
    
        @Get()
        listar(@Param('actividadId', ParseIntPipe) actividadId: number) {
            return this.listarReservaUC.ejecutar(actividadId);
        }
    
        @Patch(':id')
        ajustarCantidad(@Param('id', ParseIntPipe) id: number, @Body() dto: ajustarActividadInsumoReservaDto) {
            return this.ajustarCantidadUC.ejecutar(id, dto.cantidadReserva);
        }
    
        @Delete(':id')
        liberar(@Param('id', ParseIntPipe) id: number) {
            return this.liberarReservaUC.ejecutar(id);
        }
    }