import { actividadInsumo } from "../domain/entities/actividad-insumos.entity";
import { actividadInsumoRepositoryPort } from "../domain/port/actividad-insumo.repository.port";
import { NotFoundException } from "@nestjs/common";
import { listarActividadInsumosUseCase } from "../aplicattion/use-case/listar-actividad-insumos.use-case";
import { eliminarActividadInsumoUseCase } from "../aplicattion/use-case/eliminar-actividad-insumo.use-case";
import { registrarActividadInsumoUseCase } from "../aplicattion/use-case/registrar-actividad-insumo.use-case";

class FakeActividadInsumoRepo implements actividadInsumoRepositoryPort {
    private items: actividadInsumo[] = [];
    private nextId = 1;

    async crear(item: actividadInsumo): Promise<actividadInsumo> {
        const newItem = new actividadInsumo(
            this.nextId++,
            item.actividadId,
            item.insumoId,
            item.cantidadUsada,
            item.unidad,
            item.costoUnitario,
            item.costoTotal
        );
        this.items.push(newItem);
        return newItem;
    }

    async buscarPorId(id: number): Promise<actividadInsumo | null> {
        return this.items.find(i => i.id === id) || null;
    }

    async listarPorActividad(actividadId: number): Promise<actividadInsumo[]> {
        return this.items.filter(i => i.actividadId === actividadId);
    }

    async eliminar(id: number): Promise<void> {
        this.items = this.items.filter(i => i.id !== id);
    }
}

describe('Pruebas del Módulo Actividad Insumo', () => {
    let fakeRepo: FakeActividadInsumoRepo;
    let registrarUC: registrarActividadInsumoUseCase;
    let listarUC: listarActividadInsumosUseCase;
    let eliminarUC: eliminarActividadInsumoUseCase;

    beforeEach(() => {
        fakeRepo = new FakeActividadInsumoRepo();
        registrarUC = new registrarActividadInsumoUseCase(fakeRepo);
        listarUC = new listarActividadInsumosUseCase(fakeRepo);
        eliminarUC = new eliminarActividadInsumoUseCase(fakeRepo);
    });

    it('registra un insumo en la actividad y calcula el costo total correctamente', async () => {
        const dto = {
            insumoId: 10,
            cantidadUsada: 3,
            unidad: 'kg',
            costoUnitario: 15.50
        };

        const resultado = await registrarUC.ejecutar(1, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.actividadId).toBe(1);
        expect(resultado.costoTotal).toBe(46.50); // 3 * 15.50
    });

    it('lanza un error si la cantidad usada es menor o igual a 0', async () => {
        const dto = {
            insumoId: 10,
            cantidadUsada: 0,
            unidad: 'litros',
            costoUnitario: 10
        };

        await expect(registrarUC.ejecutar(1, dto)).rejects.toThrow('La cantidad usada debe de ser mayor a 0');
    });

    it('lista los insumos correctamente por actividad', async () => {
        await registrarUC.ejecutar(5, { insumoId: 1, cantidadUsada: 2, unidad: 'kg', costoUnitario: 10 });
        await registrarUC.ejecutar(5, { insumoId: 2, cantidadUsada: 4, unidad: 'litros', costoUnitario: 5 });
        await registrarUC.ejecutar(6, { insumoId: 3, cantidadUsada: 1, unidad: 'unidad', costoUnitario: 100 });

        const insumosActividad5 = await listarUC.ejecutar(5);
        expect(insumosActividad5.length).toBe(2);
        expect(insumosActividad5[0].insumoId).toBe(1);
        expect(insumosActividad5[1].insumoId).toBe(2);
    });

    it('elimina un insumo de la actividad exitosamente', async () => {
        const creado = await registrarUC.ejecutar(1, { insumoId: 1, cantidadUsada: 2, unidad: 'kg', costoUnitario: 10 });
        
        await eliminarUC.ejecutar(creado.id!);
        
        const lista = await listarUC.ejecutar(1);
        expect(lista.length).toBe(0);
    });

    it('lanza NotFoundException al intentar eliminar un insumo que no existe', async () => {
        await expect(eliminarUC.ejecutar(999)).rejects.toThrow(NotFoundException);
    });
});