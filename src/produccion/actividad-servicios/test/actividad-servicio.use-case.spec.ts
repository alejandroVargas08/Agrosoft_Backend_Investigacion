import { actualizarActividadServicioUseCase } from "../aplicattion/use-cases/actualizar-actividad-servicios.use-case";
import { eliminarActividadServicioUseCase } from "../aplicattion/use-cases/eliminar-actividad-servicios.use-case";
import { listarActividadServicioUseCase } from "../aplicattion/use-cases/listar-actividad-servicios.use-case";
import { registrarActividadServicioUseCase } from "../aplicattion/use-cases/registrar-actividad-servicios.use-case";
import { actividadServicio } from "../domain/entities/actividad-servicios.entity";
import { actividadServicioRepositoryPort } from "../domain/ports/actividad-servicios.repository.port";
import { NotFoundException } from "@nestjs/common";

class FakeActividadServicioRepo implements actividadServicioRepositoryPort {
    private items: actividadServicio[] = [];
    private nextId = 1;

    async crear(item: actividadServicio): Promise<actividadServicio> {
        const newItem = new actividadServicio(
            this.nextId++,
            item.actividadId,
            item.nombreServicio,
            item.proveedorId,
            item.maquinariaId,
            item.horas,
            item.precioHora,
            item.costo
        );
        this.items.push(newItem);
        return newItem;
    }

    async buscarPorId(id: number): Promise<actividadServicio | null> {
        return this.items.find(i => i.id === id) || null;
    }

    async listarPorActividad(actividadId: number): Promise<actividadServicio[]> {
        return this.items.filter(i => i.actividadId === actividadId);
    }

    async actualizar(item: actividadServicio): Promise<actividadServicio> {
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

describe('Pruebas del Módulo Actividades Servicios', () => {
    let fakeRepo: FakeActividadServicioRepo;
    let registrarUC: registrarActividadServicioUseCase;
    let listarUC: listarActividadServicioUseCase;
    let actualizarUC: actualizarActividadServicioUseCase;
    let eliminarUC: eliminarActividadServicioUseCase;

    beforeEach(() => {
        fakeRepo = new FakeActividadServicioRepo();
        registrarUC = new registrarActividadServicioUseCase(fakeRepo);
        listarUC = new listarActividadServicioUseCase(fakeRepo);
        actualizarUC = new actualizarActividadServicioUseCase(fakeRepo);
        eliminarUC = new eliminarActividadServicioUseCase(fakeRepo);
    });

    it('registra un servicio en la actividad y calcula el costo total correctamente', async () => {
        const dto = {
            nombreServicio: 'Fumigación',
            proveedorId: 2,
            maquinariaId: 5,
            horas: 4,
            precioHora: 25.00
        };

        const resultado = await registrarUC.ejecutar(1, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.actividadId).toBe(1);
        expect(resultado.costo).toBe(100.00); // 4 * 25.00
    });

    it('lanza un error si las horas son menores o iguales a 0 al crear', async () => {
        const dto = {
            nombreServicio: 'Transporte',
            proveedorId: 1,
            maquinariaId: 3,
            horas: 0,
            precioHora: 50
        };

        await expect(registrarUC.ejecutar(1, dto)).rejects.toThrow('Las horas deben de ser mayores a 0');
    });

    it('actualiza las horas de un servicio y recalcula su costo', async () => {
        const creado = await registrarUC.ejecutar(1, {
            nombreServicio: 'Arado',
            proveedorId: 1,
            maquinariaId: 2,
            horas: 2,
            precioHora: 30
        });

        const actualizado = await actualizarUC.ejecutar(creado.id!, 5);

        expect(actualizado.horas).toBe(5);
        expect(actualizado.costo).toBe(150); // 5 * 30
    });

    it('lista los servicios correctamente por actividad', async () => {
        await registrarUC.ejecutar(10, { nombreServicio: 'S1', proveedorId: 1, maquinariaId: 1, horas: 1, precioHora: 10 });
        await registrarUC.ejecutar(10, { nombreServicio: 'S2', proveedorId: 2, maquinariaId: 2, horas: 2, precioHora: 20 });
        await registrarUC.ejecutar(11, { nombreServicio: 'S3', proveedorId: 3, maquinariaId: 3, horas: 3, precioHora: 30 });

        const serviciosActividad10 = await listarUC.ejecutar(10);
        expect(serviciosActividad10.length).toBe(2);
        expect(serviciosActividad10[0].nombreServicio).toBe('S1');
        expect(serviciosActividad10[1].nombreServicio).toBe('S2');
    });

    it('elimina un servicio de la actividad exitosamente', async () => {
        const creado = await registrarUC.ejecutar(1, { nombreServicio: 'Test', proveedorId: 1, maquinariaId: 1, horas: 2, precioHora: 10 });
        
        await eliminarUC.ejecutar(creado.id!);
        
        const lista = await listarUC.ejecutar(1);
        expect(lista.length).toBe(0);
    });

    it('lanza NotFoundException al intentar actualizar o eliminar un servicio que no existe', async () => {
        await expect(actualizarUC.ejecutar(999, 5)).rejects.toThrow(NotFoundException);
        await expect(eliminarUC.ejecutar(999)).rejects.toThrow(NotFoundException);
    });
});