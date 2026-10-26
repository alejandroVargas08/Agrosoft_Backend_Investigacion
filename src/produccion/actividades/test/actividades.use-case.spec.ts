import { Actividades } from "../domain/entities/actividades.entity";
import { actividadesRepositoryPort } from "../domain/ports/actividades.repository.port";
import { crearActividadesUseCase } from "../aplicattion/use-cases/crear-actividades.use-case";
import { eliminarActividadesUseCase } from "../aplicattion/use-cases/eliminar-actividades.use-case";
import type { AlcanceDatos } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";
import type { AccesoActividadesService } from "../aplicattion/services/acceso-actividades.service";


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

    async listarVisibles(loteIdsPermitidos: number[] | null, cultivoId?: number): Promise<Actividades[]> {
        return this.actividades.filter(
            a =>
                (loteIdsPermitidos === null || loteIdsPermitidos.includes(a.loteId)) &&
                (cultivoId === undefined || a.cultivoId === cultivoId),
        );
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

// Un alcance que lo ve todo: aquí se prueban crear y eliminar, no los permisos
const ALCANCE_TOTAL: AlcanceDatos = { verTodo: true, programasPermitidos: [] };
const USUARIO_ID = 1;

// El servicio de acceso se reemplaza por uno que siempre deja pasar
const accesoQueSiempreDejaPasar = {
    validarCultivoDelLote: async () => {},
    obtenerActividadVisible: async () => ({}) as Actividades,
} as unknown as AccesoActividadesService;

describe('Prueba de actividades', () => {
    let fakeRepo: FakeactividadesRepo;

    beforeEach(() => {
        fakeRepo = new FakeactividadesRepo();
    });

    it('Crea una actividad éxitosa', async () => {
        const crearUC = new crearActividadesUseCase(fakeRepo, accesoQueSiempreDejaPasar);

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

        const resultado = await crearUC.execute(dto as any, USUARIO_ID, ALCANCE_TOTAL);

        expect(resultado).toBeDefined();
        expect(resultado.nombre).toBe('Fumigación');
    });

    it('eliminar una actividad existente', async () => {
        const crearUC = new crearActividadesUseCase(fakeRepo, accesoQueSiempreDejaPasar);
        const eliminarUC = new eliminarActividadesUseCase(fakeRepo, accesoQueSiempreDejaPasar);

        const creada = await crearUC.execute({
            nombre: 'Riego',
            tipo: 'Riego',
            loteId: 1,
            cultivoId: 1,
            fecha: new Date(),
            horasActividad: 2,
            precioHoraActividad: 10000,
            creadoPorUsuarioId: 1,
        } as any, USUARIO_ID, ALCANCE_TOTAL);

        const encontradaAntes = await fakeRepo.buscarPorId(creada.id!);
        expect(encontradaAntes).not.toBeNull();

        await eliminarUC.execute(creada.id!, ALCANCE_TOTAL);

        const encontradaDespues = await fakeRepo.buscarPorId(creada.id!);
        expect(encontradaDespues).toBeNull();
    });
});

