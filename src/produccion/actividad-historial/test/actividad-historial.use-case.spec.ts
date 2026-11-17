import { actividadHistorial } from "../domain/entities/actividad-historial.entity";
import { actividadHistorialRepositoryPort } from "../domain/ports/actividad-historial.repository.port";
import { registrarActividadHistorialUseCase } from "../aplicattion/use-cases/registrar-actividad-historial.use-case";
import { listarActividadHistorialUseCase } from "../aplicattion/use-cases/listar-actividad.historial.use-case";
import { ListarHistorialVisibleUseCase } from "../aplicattion/use-cases/listar-historial-visible.use-case";

class FakeActividadHistorialRepo implements actividadHistorialRepositoryPort {
    private historiales: actividadHistorial[] = [];

    async crear(historial: actividadHistorial): Promise<actividadHistorial> {
        this.historiales.push(historial);
        return historial;
    }

    async listarActividad(actividadId: number): Promise<actividadHistorial[]> {
        return this.historiales.filter(h => h.actividadId === actividadId);
    }

    async listarDeActividades(actividadIds: number[], limite: number): Promise<actividadHistorial[]> {
        if (actividadIds.length === 0) return [];
        return this.historiales
            .filter(h => actividadIds.includes(h.actividadId))
            .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
            .slice(0, limite);
    }
}

describe('Prueba de Actividad Historial', () => {
    let fakeRepo: FakeActividadHistorialRepo;

    beforeEach(() => {
        fakeRepo = new FakeActividadHistorialRepo();
    });

    it('registra un cambio de actividad exitosamente', async () => {
        const registrarUC = new registrarActividadHistorialUseCase(fakeRepo);

        const dto = {
            actividadId: 1,
            cultivoId: 1,
            usuarioId: 1,
            motivo: 'Cambio de fecha de riego',
            cambios: {
                fecha: { anterior: '2026-07-01', nuevo: '2026-07-03' }
            }
        };

        const resultado = await registrarUC.ejecutar(dto);

        expect(resultado).toBeDefined();
        expect(resultado.motivo).toBe('Cambio de fecha de riego');
        expect(resultado.cambios.fecha.nuevo).toBe('2026-07-03');
    });

    it('lanza un error si el motivo está vacío', async () => {
        const registrarUC = new registrarActividadHistorialUseCase(fakeRepo);

        const dto = {
            actividadId: 1,
            cultivoId: 1,
            usuarioId: 1,
            motivo: '',
            cambios: {
                horasActividad: { anterior: 2, nuevo: 4 }
            }
        };

        await expect(registrarUC.ejecutar(dto)).rejects.toThrow('El motivo del cambio es obligatorio');
    });

    it('lista el historial correctamente por actividad', async () => {
        const registrarUC = new registrarActividadHistorialUseCase(fakeRepo);
        const listarUC = new listarActividadHistorialUseCase(fakeRepo);

        await registrarUC.ejecutar({
            actividadId: 5,
            cultivoId: 1,
            usuarioId: 1,
            motivo: 'Ajuste 1',
            cambios: { campo: { anterior: 'a', nuevo: 'b' } }
        });

        await registrarUC.ejecutar({
            actividadId: 5,
            cultivoId: 1,
            usuarioId: 1,
            motivo: 'Ajuste 2',
            cambios: { campo: { anterior: 'b', nuevo: 'c' } }
        });

        const historialActividad = await listarUC.ejecutar(5);
        expect(historialActividad.length).toBe(2);
        expect(historialActividad[0].motivo).toBe('Ajuste 1');
    });

    describe('ListarHistorialVisibleUseCase', () => {
        const alcance = { verTodo: true, programasPermitidos: [] as number[] };

        const sembrar = async (actividadId: number) => {
            await fakeRepo.crear(actividadHistorial.crear({
                actividadId,
                cultivoId: 1,
                usuarioId: 1,
                motivo: 'cambio en la actividad ' + actividadId,
                cambios: { estado: { anterior: 'Pendiente', nuevo: 'Completada' } },
            }));
        };

        const accesoCon = (ids: number[]) =>
            ({ listar: async () => ids.map((id) => ({ id })) }) as never;

        it('solo devuelve el historial de las actividades visibles', async () => {
            await sembrar(1);
            await sembrar(2);
            await sembrar(3);

            const uc = new ListarHistorialVisibleUseCase(fakeRepo, accesoCon([1, 3]));
            const resultado = await uc.ejecutar(alcance);

            expect(resultado).toHaveLength(2);
            expect(resultado.map((h) => h.actividadId).sort()).toEqual([1, 3]);
        });

        it('devuelve vacio si el usuario no ve ninguna actividad', async () => {
            await sembrar(1);

            const uc = new ListarHistorialVisibleUseCase(fakeRepo, accesoCon([]));

            // Sin este caso, un In([]) vacio en TypeORM traeria toda la tabla
            expect(await uc.ejecutar(alcance)).toEqual([]);
        });

        it('respeta el limite', async () => {
            await sembrar(1);
            await sembrar(1);
            await sembrar(1);

            const uc = new ListarHistorialVisibleUseCase(fakeRepo, accesoCon([1]));

            expect(await uc.ejecutar(alcance, 2)).toHaveLength(2);
        });
    });
});
