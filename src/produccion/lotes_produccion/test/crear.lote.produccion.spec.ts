import { loteProduccion } from "../domain/entities/lotes.produccion.entity";
import { loteProduccionRepositoryPort } from "../domain/ports/lotes.produccion.repository.port";
import { CrearLoteProduccionUseCase } from "../application/use-cases/crear-lotes-produccion.uses-case";
import { CrearLoteProduccionDto } from "../application/dtos/crear-lote.produccion.dto";

class FakeLoteProduccionRepo implements loteProduccionRepositoryPort {

    async crear(l: loteProduccion): Promise<loteProduccion> { return l;}
    async buscarPorId(): Promise<loteProduccion | null> { return null;}
    async listarTodos(): Promise<loteProduccion[]> { return [];}
    async listarPorCultivo(): Promise<loteProduccion[]> { return [];}
    async actualizar(l: loteProduccion): Promise<loteProduccion> { return l;}
    async eliminar(): Promise<void> {}
}

describe('CrearLoteProduccionUseCase', () => {
    it('Crear lote de producción exoitosamente', async() => {
        const uc= new CrearLoteProduccionUseCase(new FakeLoteProduccionRepo());

        const dto: CrearLoteProduccionDto = {
            productoAgroId: 1,
            cultivoId: 1,
            loteId: 1,
            calidad: 'Alta',
            cantidadKg: 50.5,
            stockDisponibleKg: 50.5,
            costoUnitarioKg: 5,
            costoTotal: 0,
            precioSugeridoKg: 15
        };

        const loteProd = await uc.ejecutar(dto);

        expect(loteProd.cantidadKg).toBe(50.5);
        expect(loteProd.costoTotal).toBe(252.5);
    });
})