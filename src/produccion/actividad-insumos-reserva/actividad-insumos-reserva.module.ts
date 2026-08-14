import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { actividadInsumoReservaOrmEntity } from './infrastructure/persistence/actividad-insumo-reserva.orm-entity';
import { actividadInsumoReservaController } from './infrastructure/http/actividad-insumo-reserva.controller';
import { reservarActividadInsumoReservaUseCase } from './application/use-cases/reservar-actividad-insumo-reserva.use-case';
import { listarActividadInsumoReservaUseCase } from './application/use-cases/listar-actividad-insumo-reserva.use-case';
import { ajustarCantidadActividadInsumoReservaUseCase } from './application/use-cases/ajustar-cantidad-actividad-insumo-reserva.use-case';
import { liberarActividadInsumoReservaUseCase } from './application/use-cases/liberar-actividad-insumo-reserva.use-case';
import { consumirActividadInsumoReservaUseCase } from './application/use-cases/consumir-actividad-insumo-reserva.use-case';
import { actividad_insumoReservaRepository } from './domain/ports/actividad-insumos-reserva.repository.ports';
import { actividadInsumoReservaRepositoryImpl } from './infrastructure/persistence/actividad-insumo-reserva.repository.impl';

@Module({
    imports: [
        TypeOrmModule.forFeature([actividadInsumoReservaOrmEntity])
    ],
    controllers: [actividadInsumoReservaController],
    providers: [
        reservarActividadInsumoReservaUseCase,
        listarActividadInsumoReservaUseCase,
        ajustarCantidadActividadInsumoReservaUseCase,
        liberarActividadInsumoReservaUseCase,
        consumirActividadInsumoReservaUseCase,
        {provide: actividad_insumoReservaRepository, useClass: actividadInsumoReservaRepositoryImpl},
    ],
    exports: [actividad_insumoReservaRepository, consumirActividadInsumoReservaUseCase]
})
export class ActividadInsumosReservaModule {}
