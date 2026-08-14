import { registrarCambioHistorialCultivoUseCase } from "../application/use-cases/registrar-historial-cultivo.use-case";
import { historialCultivo } from "../domain/entities/historial-cultivo.entity";
import { HistorialCultivoRepositoryPort } from "../domain/ports/historial-cultivo.port";

class FakeHistorialCultivoRepo implements HistorialCultivoRepositoryPort {
    async registrar(historial: historialCultivo): Promise<historialCultivo> {
        return historial;
    }
    async listarPorCultivo(cultivoId: number): Promise<historialCultivo[]> {
        return [];
    }
}
    it('Registra un cambio en el historial del cultivo correctamente', async () => {
        const fakeRepo = new FakeHistorialCultivoRepo();
        const uc = new registrarCambioHistorialCultivoUseCase(fakeRepo);
        const resultado = await uc.execute({
            cultivoId: 1,
            usuarioId: 2,
            motivo: 'Actualización de fertilización',
            cambios: { etapa: 'Crecimiento'},
        } as any);

        expect(resultado.cultivoId).toBe(1);
        expect(resultado.motivo).toBe('Actualización de fertilización');
        expect(resultado.cambios).toEqual({ etapa:'Crecimiento'}); 
    });