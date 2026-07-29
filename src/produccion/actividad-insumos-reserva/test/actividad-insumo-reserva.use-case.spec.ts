import { NotFoundException } from '@nestjs/common';
import { actividadInsumoReserva } from '../domain/entities/actividad-insumos-reserva.entity';
import { actividadInsumoReservaRepositoryPort } from '../domain/ports/actividad-insumos-reserva.repository.ports';
import { reservarActividadInsumoReservaUseCase } from '../application/use-cases/reservar-actividad-insumo-reserva.use-case';
import { listarActividadInsumosUseCase } from '../../actividad-insumos/aplicattion/use-case/listar-actividad-insumos.use-case';
import { ajustarCantidadActividadInsumoReservaUseCase } from '../application/use-cases/ajustar-cantidad-actividad-insumo-reserva.use-case';
import { liberarActividadInsumoReservaUseCase } from '../application/use-cases/liberar-actividad-insumo-reserva.use-case';
import { consumirActividadInsumoReservaUseCase } from '../application/use-cases/consumir-actividad-insumo-reserva.use-case';

// 1. Fake Repository en Memoria para las Pruebas
class FakeActividadInsumoReservaRepository implements actividadInsumoReservaRepositoryPort {
    private items: actividadInsumoReserva[] = [];
    private autoIncrementId = 1;

    async crear(item: actividadInsumoReserva): Promise<actividadInsumoReserva> {
        const nuevoItem = new actividadInsumoReserva(
            this.autoIncrementId++,
            item.actividadId,
            item.insumoId,
            item.cantidadReservada,
        );
        this.items.push(nuevoItem);
        return nuevoItem;
    }

    async buscarPorId(id: number): Promise<actividadInsumoReserva | null> {
        const item = this.items.find((i) => i.id === id);
        return item || null;
    }

    async buscarActividadInsumoReserva(actividadId: number, insumoId: number): Promise<actividadInsumoReserva | null> {
        const item = this.items.find((i) => i.actividadId === actividadId && i.insumoId === insumoId);
        return item || null;
    }

    async listarPorActividad(actividadId: number): Promise<actividadInsumoReserva[]> {
    return this.items.filter((i) => i.actividadId === actividadId);
    }

    async actualizar(item: actividadInsumoReserva): Promise<actividadInsumoReserva> {
        const index = this.items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        }
        return item;
    }

    async eliminar(id: number): Promise<void> {
        this.items = this.items.filter((i) => i.id !== id);
    }
}

// 2. Suite de Pruebas Unitarias
describe('Actividad Insumo Reserva - Casos de Uso', () => {
    let repo: FakeActividadInsumoReservaRepository;
    let reservarUC: reservarActividadInsumoReservaUseCase;
    let listarUC: listarActividadInsumosUseCase;
    let ajustarUC: ajustarCantidadActividadInsumoReservaUseCase;
    let liberarUC: liberarActividadInsumoReservaUseCase;
    let consumirUC: consumirActividadInsumoReservaUseCase;

    beforeEach(() => {
        repo = new FakeActividadInsumoReservaRepository();
        reservarUC = new reservarActividadInsumoReservaUseCase(repo);
        listarUC = new listarActividadInsumosUseCase(repo);
        ajustarUC = new ajustarCantidadActividadInsumoReservaUseCase(repo);
        liberarUC = new liberarActividadInsumoReservaUseCase(repo);
        consumirUC = new consumirActividadInsumoReservaUseCase(repo);
    });

    it('debería reservar un insumo para una actividad exitosamente', async () => {
        const resultado = await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 5 });

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.actividadId).toBe(1);
        expect(resultado.insumoId).toBe(10);
        expect(resultado.cantidadReservada).toBe(5);
    });

    it('no debería permitir reservar con cantidad menor o igual a 0', async () => {
        await expect(
            reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 0 })
        ).rejects.toThrow('La cantidad reservada debe ser mayor a 0');
    });

    it('debería listar las reservas asociadas a una actividad', async () => {
        await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 2 });
        await reservarUC.ejecutar(1, { insumoId: 11, cantidadReservada: 3 });
        await reservarUC.ejecutar(2, { insumoId: 10, cantidadReservada: 4 }); // Otra actividad

        const listaActividad1 = await listarUC.ejecutar(1);
        expect(listaActividad1.length).toBe(2);
        expect(listaActividad1[0].insumoId).toBe(10);
        expect(listaActividad1[1].insumoId).toBe(11);
    });

    it('debería ajustar la cantidad de una reserva existente', async () => {
        const creada = await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 5 });
        const ajustada = await ajustarUC.ejecutar(creada.id!, 12);

        expect(ajustada.cantidadReservada).toBe(12);
    });

    it('debería lanzar NotFoundException al intentar ajustar una reserva que no existe', async () => {
        await expect(ajustarUC.ejecutar(999, 10)).rejects.toThrow(NotFoundException);
    });

    it('debería liberar (eliminar) una reserva existente', async () => {
        const creada = await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 5 });
        await liberarUC.ejecutar(creada.id!);

        const encontrada = await repo.buscarPorId(creada.id!);
        expect(encontrada).toBeNull();
    });

    it('debería consumir parcialmente la reserva si la cantidad es menor a la reservada', async () => {
        await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 10 });
        
        await consumirUC.ejecutar(1, 10, 4); // Consume 4 de 10

        const reservaRestante = await repo.buscarActividadInsumoReserva(1, 10);
        expect(reservaRestante).not.toBeNull();
        expect(reservaRestante?.cantidadReservada).toBe(6);
    });

    it('debería eliminar la reserva por completo si el consumo agota toda la cantidad reservada', async () => {
        await reservarUC.ejecutar(1, { insumoId: 10, cantidadReservada: 10 });
        
        await consumirUC.ejecutar(1, 10, 10); // Consume todo

        const reservaRestante = await repo.buscarActividadInsumoReserva(1, 10);
        expect(reservaRestante).toBeNull();
    });
});