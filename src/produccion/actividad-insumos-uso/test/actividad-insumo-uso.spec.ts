import { actividadInsumoUso } from '../domain/entities/actividad-insumos-uso.entity';
import { actividadInsumoUsoRepositoryPort } from '../domain/ports/actividad-insumos-uso.repository.port';
import { registrarInsumoUseCase } from '../application/use-cases/registrar-insumo-uso.use-case';
import { listarActividadInsumoUsoUseCase } from '../application/use-cases/listar-actividad-insumo-uso.use-case';

// 1. Fake Repository en Memoria para las Pruebas
class FakeActividadInsumoUsoRepository implements actividadInsumoUsoRepositoryPort {
    private items: actividadInsumoUso[] = [];
    private autoIncrementId = 1;

    async crear(item: actividadInsumoUso): Promise<actividadInsumoUso> {
        const nuevoItem = new actividadInsumoUso(
            this.autoIncrementId++,
            item.actividadId,
            item.insumoId,
            item.cantidadUso,
            item.costoUnitarioUso,
            item.costoTotal,
            item.movimientoInsumoId,
        );
        this.items.push(nuevoItem);
        return nuevoItem;
    }

    async buscarPorId(id: number): Promise<actividadInsumoUso | null> {
        const item = this.items.find((i) => i.id === id);
        return item || null;
    }

    async listarActividad(actividadId: number): Promise<actividadInsumoUso[]> {
        return this.items.filter((i) => i.actividadId === actividadId);
    }

    async actualizar(item: actividadInsumoUso): Promise<actividadInsumoUso> {
        const index = this.items.findIndex((i) => i.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        }
        return item;
    }
}

// 2. Suite de Pruebas Unitarias
describe('Actividad Insumo Uso - Casos de Uso', () => {
    let repo: FakeActividadInsumoUsoRepository;
    let registrarUsoUC: registrarInsumoUseCase;
    let listarUsoUC: listarActividadInsumoUsoUseCase;

    beforeEach(() => {
        repo = new FakeActividadInsumoUsoRepository();
        // Opcionalmente pasamos undefined o un mock si requerimos el caso de uso de reserva, 
        // pero para aislar este test, el parámetro opcional de consumo de reserva puede omitirse o simularse.
        registrarUsoUC = new registrarInsumoUseCase(repo);
        listarUsoUC = listarActividadInsumoUsoUseCase ? new listarActividadInsumoUsoUseCase(repo) : null as any;
    });

    it('debería registrar el uso de un insumo y calcular el costo total correctamente', async () => {
        const dto = {
            insumoId: 10,
            cantidadUso: 3,
            costoUnitarioUso: 15.5,
        };

        const resultado = await registrarUsoUC.ejecutar(1, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.actividadId).toBe(1);
        expect(resultado.insumoId).toBe(10);
        expect(resultado.cantidadUso).toBe(3);
        expect(resultado.costoUnitarioUso).toBe(15.5);
        expect(resultado.costoTotal).toBe(46.5); // 3 * 15.5
        expect(resultado.movimientoInsumoId).toBeNull();
    });

    it('no debería permitir registrar un uso con cantidad menor o igual a 0', async () => {
        const dto = {
            insumoId: 10,
            cantidadUso: 0,
            costoUnitarioUso: 10,
        };

        await expect(registrarUsoUC.ejecutar(1, dto)).rejects.toThrow('La cantidad usada debe ser mayor a 0');
    });

    it('no debería permitir registrar un uso con costo unitario negativo', async () => {
        const dto = {
            insumoId: 10,
            cantidadUso: 5,
            costoUnitarioUso: -2,
        };

        await expect(registrarUsoUC.ejecutar(1, dto)).rejects.toThrow('El costo unitario no puede ser negativo');
    });

    it('debería listar los usos de insumos asociados a una actividad específica', async () => {
        await registrarUsoUC.ejecutar(1, { insumoId: 10, cantidadUso: 2, costoUnitarioUso: 10 });
        await registrarUsoUC.ejecutar(1, { insumoId: 11, cantidadUso: 4, costoUnitarioUso: 5 });
        await registrarUsoUC.ejecutar(2, { insumoId: 10, cantidadUso: 1, costoUnitarioUso: 20 }); // De otra actividad

        const listaActividad1 = await listarUsoUC.ejecutar(1);

        expect(listaActividad1.length).toBe(2);
        expect(listaActividad1[0].insumoId).toBe(10);
        expect(listaActividad1[1].insumoId).toBe(11);
    });
});