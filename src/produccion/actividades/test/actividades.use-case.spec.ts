import { Actividades } from "../domain/entities/actividades.entity";
import { actividadesRepositoryPort } from "../domain/ports/actividades.repository.port";
import { crearActividadesUseCase } from "../aplicattion/use-cases/crear-actividades.use-case";
import { eliminarActividadesUseCase } from "../aplicattion/use-cases/eliminar-actividades.use-case";


class FakeactividadesRepo implements actividadesRepositoryPort {
    private actividades: Actividades[] = [];

    async crear(actividades: Actividades): Promise<Actividades> {
        this.actividades.push(actividades);
        return actividades;
    }

    async buscarPorId(id: number): Promise<Actividades | null> {
        const found = this.actividades.find(a => a.id === id);
        return found || null;
    }

    async listarPorCultivo(cultivoId: number): Promise<Actividades[]> {
        return this.actividades.filter(a => a.cultivoId === cultivoId);
    }

    async actualizar(actividad: Actividades): Promise<Actividades> {
        const index = this.actividades.findIndex(a => a.id === actividad.id);
        if (index >= 0) {
            this.actividades[index] = actividad;
        }
        return actividad;
    }

    async eliminar(id: number): Promise<void> {
        this.actividades = this.actividades.filter(a => a.id !== id);
    }
}

describe('Prueba de actividades', () => {
    let fakeRepo: FakeactividadesRepo;

    beforeEach(() => {
        fakeRepo = new FakeactividadesRepo();
    });

    it('Crea una actividad éxitosa', async () => {
        const crearUC = new crearActividadesUseCase(fakeRepo);

        const dto = {
            nombre: 'Fumigación',
            tipo: 'Mantenimiento',
            subtipo: null,
            loteId: 1,
            subLoteId: null,
            cultivoId: 1,
            fecha: new Date(),
            horasActividad: 3,
            precioHoraActividad: 15000,
            descripcion: 'Control de plagas',
            creadoPorUsuarioId: 1,
            cantidadPlantas: null,
            productoAgroId: null,
        };

        const resultado = await crearUC.execute(dto as any);

        expect(resultado).toBeDefined();
        expect(resultado.nombre).toBe('Fumigación');
    });

    it('eliminar una actividad existente', async () => {
        const crearUC = new crearActividadesUseCase(fakeRepo);
        const eliminarUC = new eliminarActividadesUseCase(fakeRepo);

        const creada = await crearUC.execute({
            nombre: 'Riego',
            tipo: 'Riego',
            loteId: 1,
            cultivoId: 1,
            fecha: new Date(),
            horasActividad: 2,
            precioHoraActividad: 10000,
            creadoPorUsuarioId: 1,
        } as any);

        const encontradaAntes = await fakeRepo.buscarPorId(creada.id);
        expect(encontradaAntes).not.toBeNull();

        await eliminarUC.execute(creada.id);

        const encontradaDespues = await fakeRepo.buscarPorId(creada.id);
        expect(encontradaDespues).toBeNull();
    });
});

