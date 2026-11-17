import { movimientoProduccion } from '../domain/entities/movimiento-produccion.entity';
import { movimientoProduccionRepositoryPort } from '../domain/ports/movimiento-produccion.repository.port';
import { registrarMovimientoProduccionUseCase } from '../application/use-cases/registrar-movimiento-produccion.use-case';
import { listarMovimientoProduccionUseCase } from '../application/use-cases/listar-movimiento-produccion.use-case';

class FakeMovimientoProduccionRepository implements movimientoProduccionRepositoryPort {
    private items: movimientoProduccion[] = [];
    private autoIncrementId = 1;

    async crear(item: movimientoProduccion): Promise<movimientoProduccion> {
        const nuevoItem = new movimientoProduccion(
            this.autoIncrementId++,
            item.loteProduccionId,
            item.tipo,
            item.cantidadKg,
            item.costoUnitarioKg,
            item.precioUnitarioKg,
            item.costoTotal,
            item.ventaId,
            item.descripcion,
            item.usuarioId,
            item.fecha,
        );
        this.items.push(nuevoItem);
        return nuevoItem;
    }

    async listarLoteProduccion(loteProduccionId: number): Promise<movimientoProduccion[]> {
        return this.items.filter((i) => i.loteProduccionId === loteProduccionId);
    }
}

describe('Movimiento Produccion - Casos de Uso', () => {
    let repo: FakeMovimientoProduccionRepository;
    let registrarUC: registrarMovimientoProduccionUseCase;
    let listarUC: listarMovimientoProduccionUseCase;

    beforeEach(() => {
        repo = new FakeMovimientoProduccionRepository();
        registrarUC = new registrarMovimientoProduccionUseCase(repo);
        listarUC = new listarMovimientoProduccionUseCase(repo);
    });

    it('debería registrar un movimiento de entrada y calcular el costo total correctamente', async () => {
        const dto = {
            tipo: 'entrada' as const,
            cantidadKg: 100,
            costoUnitarioKg: 10,
            precioUnitarioKg: 15,
            usuarioId: 1,
        };

        const resultado = await registrarUC.ejecutar(1, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.loteProduccionId).toBe(1);
        expect(resultado.costoTotal).toBe(1000); // 100 * 10
    });

    it('debería rechazar un movimiento de salida sin ventaId ni descripcion', async () => {
        const dto = {
            tipo: 'salida' as const,
            cantidadKg: 50,
            costoUnitarioKg: 10,
            precioUnitarioKg: 15,
            usuarioId: 1,
        };

        await expect(registrarUC.ejecutar(1, dto)).rejects.toThrow(
            'Un movimiento de salida requiere una venta asociada o una descripción del motivo'
        );
    });

    it('debería listar los movimientos de un lote específico', async () => {
        await registrarUC.ejecutar(1, {
            tipo: 'entrada',
            cantidadKg: 100,
            costoUnitarioKg: 10,
            precioUnitarioKg: 15,
            usuarioId: 1,
        });

        await registrarUC.ejecutar(1, {
            tipo: 'salida',
            cantidadKg: 20,
            costoUnitarioKg: 10,
            precioUnitarioKg: 15,
            descripcion: 'Venta local',
            usuarioId: 1,
        });

        const movimientos = await listarUC.ejecutar(1);
        expect(movimientos.length).toBe(2);
        expect(movimientos[0].tipo).toBe('entrada');
        expect(movimientos[1].tipo).toBe('salida');
    });
});