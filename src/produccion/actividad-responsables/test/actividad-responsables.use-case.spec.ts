import { ConflictException, NotFoundException } from "@nestjs/common";
import { actividadResponsable } from "../domain/entities/actividad-responsable.entity";
import { actividadResponsableRepositoryPort } from "../domain/ports/actividad-responsable.port";
import { eliminarActividadResponsablesUseCase } from "../application/use-cases/eliminar-actividad-responsables.use-case";
import { actualizarActividadResponsablesUseCase } from "../application/use-cases/actualizar-actividad-resposables.use-case";
import { listarActividadResponsablesUseCase } from "../application/use-cases/listar-actividad-responsables.use-case";
import { registrarActividadResponsableUseCase } from "../application/use-cases/registrar-actividad-responsables.use-case";

class FakeActividadResponsableRepo implements actividadResponsableRepositoryPort {
    private items: actividadResponsable[] = [];
    private nextId = 1;

    async crear(item: actividadResponsable): Promise<actividadResponsable> {
        const newItem = new actividadResponsable(
            this.nextId++,
            item.actividadId,
            item.usuarioId,
            item.horas,
            item.precioHora,
            item.costo
        );
        this.items.push(newItem);
        return newItem;
    }

    async buscarPorId(id: number): Promise<actividadResponsable | null> {
        return this.items.find(i => i.id === id) || null;
    }

    async existePorActividadUsuario(actividadId: number, usuarioId: number): Promise<boolean> {
        return this.items.some(i => i.actividadId === actividadId && i.usuarioId === usuarioId);
    }

    async listarPorActividad(actividadId: number): Promise<actividadResponsable[]> {
        return this.items.filter(i => i.actividadId === actividadId);
    }

    async actualizar(item: actividadResponsable): Promise<actividadResponsable> {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        }
        return item;
    }

    async eliminar(id: number): Promise<void> {
        this.items = this.items.filter(i => i.id !== id);
    }
}

describe('Pruebas del Módulo Actividades Responsables', () => {
    let fakeRepo: FakeActividadResponsableRepo;
    let registrarUC: registrarActividadResponsableUseCase;
    let listarUC: listarActividadResponsablesUseCase;
    let actualizarUC: actualizarActividadResponsablesUseCase;
    let eliminarUC: eliminarActividadResponsablesUseCase;

    beforeEach(() => {
        fakeRepo = new FakeActividadResponsableRepo();
        registrarUC = new registrarActividadResponsableUseCase(fakeRepo);
        listarUC = listarActividadResponsablesUseCase ? new listarActividadResponsablesUseCase(fakeRepo) : ({} as any);
        actualizarUC = new actualizarActividadResponsablesUseCase(fakeRepo);
        eliminarUC = new eliminarActividadResponsablesUseCase(fakeRepo);
    });

    it('registra un responsable de actividad con costo calculado correctamente', async () => {
        const dto = { usuarioId: 1, horas: 4, precioHora: 25 };

        const resultado = await registrarUC.ejecutar(10, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.costo).toBe(100); // 4 * 25
    });

    it('lanza ConflictException si el usuario ya está registrado como responsable en la misma actividad', async () => {
        const dto = { usuarioId: 1, horas: 4, precioHora: 25 };

        await registrarUC.ejecutar(10, dto);

        await expect(registrarUC.ejecutar(10, dto)).rejects.toThrow(ConflictException);
    });

    it('actualiza las horas y recalcula el costo de un responsable existente', async () => {
        const creado = await registrarUC.ejecutar(10, { usuarioId: 2, horas: 2, precioHora: 50 });

        const actualizado = await actualizarUC.ejecutar(creado.id!, 5);

        expect(actualizado.horas).toBe(5);
        expect(actualizado.costo).toBe(250); // 5 * 50
    });

    it('lista los responsables filtrados por actividad correctamente', async () => {
        await registrarUC.ejecutar(10, { usuarioId: 1, horas: 2, precioHora: 10 });
        await registrarUC.ejecutar(10, { usuarioId: 2, horas: 3, precioHora: 10 });
        await registrarUC.ejecutar(20, { usuarioId: 1, horas: 1, precioHora: 10 });

        const lista = await listarUC.ejecutar(10);
        expect(lista.length).toBe(2);
    });

    it('elimina un responsable de manera exitosa', async () => {
        const creado = await registrarUC.ejecutar(10, { usuarioId: 1, horas: 2, precioHora: 10 });

        await eliminarUC.ejecutar(creado.id!);

        const lista = await listarUC.ejecutar(10);
        expect(lista.length).toBe(0);
    });

    it('lanza NotFoundException al intentar actualizar o eliminar un responsable que no existe', async () => {
        await expect(actualizarUC.ejecutar(999, 5)).rejects.toThrow(NotFoundException);
        await expect(eliminarUC.ejecutar(999)).rejects.toThrow(NotFoundException);
    });
});