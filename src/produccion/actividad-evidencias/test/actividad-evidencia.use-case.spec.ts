import { AgregarImagenActividadEvidenciaUseCase } from "../aplicattion/use-cases/agregar-actividad-evidencia.use-case";
import { eliminarEvidenciaActividadUseCase } from "../aplicattion/use-cases/eliminar-actividad.evidencia.use-case";
import { listarActividadEvidenciaUseCase } from "../aplicattion/use-cases/listar-actividad-evidencia.use-case";
import { registrarActividadEvidenciaUseCase } from "../aplicattion/use-cases/registrar-actividad-evidencia.use-case";
import { actividadEvidencia } from "../domain/entities/actividad-evidencia.entity";
import { actividadEvidenciaRepositoryPort } from "../domain/ports/actividad-evidencias.repository.port";
import { NotFoundException } from "@nestjs/common";

class FakeActividadEvidenciaRepo implements actividadEvidenciaRepositoryPort {
    private items: actividadEvidencia[] = [];
    private nextId = 1;

    async crear(item: actividadEvidencia): Promise<actividadEvidencia> {
        const newItem = new actividadEvidencia(
            this.nextId++,
            item.actividadId,
            item.descripcion,
            item.imagenes
        );
        this.items.push(newItem);
        return newItem;
    }

    async buscarPorId(id: number): Promise<actividadEvidencia | null> {
        return this.items.find(i => i.id === id) || null;
    }

    async listarPorActividad(actividadId: number): Promise<actividadEvidencia[]> {
        return this.items.filter(i => i.actividadId === actividadId);
    }

    async actualizar(item: actividadEvidencia): Promise<actividadEvidencia> {
        const index = this.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        }
        return item;
    }

    async eliminar(id: number): Promise<void> {
        this.items = this.items.filter(i => i.id !== id);
    }
}

describe('Pruebas del Módulo Actividades Evidencias', () => {
    let fakeRepo: FakeActividadEvidenciaRepo;
    let registrarUC: registrarActividadEvidenciaUseCase;
    let listarUC: listarActividadEvidenciaUseCase;
    let agregarImagenUC: AgregarImagenActividadEvidenciaUseCase;
    let eliminarUC: eliminarEvidenciaActividadUseCase;

    beforeEach(() => {
        fakeRepo = new FakeActividadEvidenciaRepo();
        registrarUC = new registrarActividadEvidenciaUseCase(fakeRepo);
        listarUC = new listarActividadEvidenciaUseCase(fakeRepo);
        agregarImagenUC = new AgregarImagenActividadEvidenciaUseCase(fakeRepo);
        eliminarUC = new eliminarEvidenciaActividadUseCase(fakeRepo);
    });

    it('registra una evidencia con descripción e imágenes correctamente', async () => {
        const dto = {
            descripcion: 'Evidencia de riego en lote 1',
            imagenes: ['https://example.com/img1.jpg']
        };

        const resultado = await registrarUC.ejecutar(1, dto);

        expect(resultado).toBeDefined();
        expect(resultado.id).toBe(1);
        expect(resultado.actividadId).toBe(1);
        expect(resultado.descripcion).toBe(dto.descripcion);
        expect(resultado.imagenes.length).toBe(1);
    });

    it('lanza un error si se intenta registrar una evidencia sin descripción y sin imágenes', async () => {
        const dto = {
            descripcion: '',
            imagenes: []
        };

        await expect(registrarUC.ejecutar(1, dto)).rejects.toThrow('la evidencia debe de tener almenos una descripcion o una imagen');
    });

    it('agrega una nueva imagen a una evidencia existente de forma exitosa', async () => {
        const creada = await registrarUC.ejecutar(1, {
            descripcion: 'Avance de cultivo',
            imagenes: ['https://example.com/foto1.jpg']
        });

        const actualizada = await agregarImagenUC.ejecutar(creada.id!, 'https://example.com/foto2.jpg');

        expect(actualizada.imagenes.length).toBe(2);
        expect(actualizada.imagenes).toContain('https://example.com/foto2.jpg');
    });

    it('lista las evidencias filtradas por actividad correctamente', async () => {
        await registrarUC.ejecutar(10, { descripcion: 'Evidencia 1', imagenes: [] });
        await registrarUC.ejecutar(10, { descripcion: 'Evidencia 2', imagenes: [] });
        await registrarUC.ejecutar(11, { descripcion: 'Evidencia 3', imagenes: [] });

        const evidenciasActividad10 = await listarUC.ejecutar(10);
        expect(evidenciasActividad10.length).toBe(2);
        expect(evidenciasActividad10[0].descripcion).toBe('Evidencia 1');
        expect(evidenciasActividad10[1].descripcion).toBe('Evidencia 2');
    });

    it('elimina una evidencia de manera exitosa', async () => {
        const creada = await registrarUC.ejecutar(1, { descripcion: 'Para borrar', imagenes: [] });
        
        await eliminarUC.ejecutar(creada.id!);
        
        const lista = await listarUC.ejecutar(1);
        expect(lista.length).toBe(0);
    });

    it('lanza NotFoundException al intentar modificar o eliminar una evidencia que no existe', async () => {
        await expect(agregarImagenUC.ejecutar(999, 'https://example.com/img.jpg')).rejects.toThrow(NotFoundException);
        await expect(eliminarUC.ejecutar(999)).rejects.toThrow(NotFoundException);
    });
});