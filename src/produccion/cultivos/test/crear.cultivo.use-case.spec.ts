import { Cultivo } from "../domain/entities/cultivo.entity";
import { CultivoRepositoryPort } from "../domain/ports/cultivo.repository.port";
import { CrearCultivoUseCase } from "../application/use-cases/crear.cultivo.use-case";
import type { AlcanceDatos } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";
import type { AccesoCultivosService } from "../application/services/acceso-cultivos.service";

class FakeCultivoRepo implements CultivoRepositoryPort {
    async crear(c: Cultivo) { return c; }
    async buscarPorId() { return null; }
    async listarPorLote() { return []; }
    async idsPorLotes() { return []; }
    async actualizar(c: Cultivo) { return c; }
    async eliminar() {}
}

// Un alcance que lo ve todo: aquí se prueba la creación, no los permisos
const ALCANCE_TOTAL: AlcanceDatos = { verTodo: true, programasPermitidos: [] };

// El servicio de acceso se reemplaza por uno que siempre deja pasar
const accesoQueSiempreDejaPasar = {
    validarLote: async () => {},
} as unknown as AccesoCultivosService;

it('crea un cultivo en estado activo', async () => {
    const uc = new CrearCultivoUseCase(new FakeCultivoRepo(), accesoQueSiempreDejaPasar);

    const cultivo = await uc.ejecutar(
        {
            nombreCultivo: 'Maiz',
            tipoCultivo: 'Ni idea',
            loteId: 1,
            fechaSiembra: '2026-01-01',
        } as any,
        ALCANCE_TOTAL,
    );

    expect(cultivo.estado).toBe('activo');
});
