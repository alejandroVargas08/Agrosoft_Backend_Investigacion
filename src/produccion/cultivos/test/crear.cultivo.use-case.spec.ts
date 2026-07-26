import { Cultivo } from "../domain/entities/cultivo.entity";
import { CultivoRepositoryPort } from "../domain/ports/cultivo.repository.port";
import { CrearCultivoUseCase } from "../application/use-cases/crear.cultivo.use-case";

class FakeCultivoRepo implements CultivoRepositoryPort{
    async crear(c: Cultivo) { return c;}
    async buscarPorId() {return null;}
    async listarPorLote() { return []; }
    async actualizar(c: Cultivo) { return c;}
    async eliminar() {}
}

    it('crea un cultivo en estado activo', async () => {
            const uc = new CrearCultivoUseCase(new FakeCultivoRepo());

            const cultivo = await uc.ejecutar({
                nombreCultivo: 'Maiz',
                tipoCultivo: 'Ni idea',
                loteId: 1,
                fechaSiembra: '2026-01-01',
            } as any);

            expect(cultivo.estado).toBe('activo');
        });