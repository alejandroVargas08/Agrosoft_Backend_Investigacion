import { NotFoundException } from '@nestjs/common';
import { actividadHerramienta } from '../domain/entities/actividad-herramientas.entity';
import { asignarActividadHerramientaUseCase } from '../application/use-cases/asignar-actividad-herramienta.use-case';
import { listarActividadHerramientaUseCase } from '../application/use-cases/listar-actividad-herramienta.use-case';
import { reEstimarActividadHerramientaUseCase } from '../application/use-cases/reestimar-actividad-herramienta.use.case';
import { quitarActividadHerramientaUseCase } from '../application/use-cases/quitar-actividad-herramienra.use-case';

class FakeActividadHerramientaRepo implements actividadHerramientaRepositoryPort {
  private items: actividadHerramienta[] = [];
  private nextId = 1;

  async crear(item: actividadHerramienta): Promise<actividadHerramienta> {
    const newItem = new actividadHerramienta(
      this.nextId++,
      item.actividadId,
      item.insumoId,
      item.activoFijoId,
      item.horasEstimadas,
    );
    this.items.push(newItem);
    return newItem;
  }

  async buscarPorId(id: number): Promise<actividadHerramienta | null> {
    return this.items.find(i => i.id === id) || null;
  }

  async listarPorActividad(actividadId: number): Promise<actividadHerramienta[]> {
    return this.items.filter(i => i.actividadId === actividadId);
  }

  async actualizar(item: actividadHerramienta): Promise<actividadHerramienta> {
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

describe('Pruebas del Módulo Actividades Herramientas', () => {
  let fakeRepo: FakeActividadHerramientaRepo;
  let asignarUC: asignarActividadHerramientaUseCase;
  let listarUC: listarActividadHerramientaUseCase;
  let reestimarUC: reEstimarActividadHerramientaUseCase;
  let quitarUC: quitarActividadHerramientaUseCase;

  beforeEach(() => {
    fakeRepo = new FakeActividadHerramientaRepo();
    asignarUC = new asignarActividadHerramientaUseCase(fakeRepo);
    listarUC = new listarActividadHerramientaUseCase(fakeRepo);
    reestimarUC = new reEstimarActividadHerramientaUseCase(fakeRepo);
    quitarUC = new quitarActividadHerramientaUseCase(fakeRepo);
  });

  it('asigna una herramienta a una actividad correctamente', async () => {
    const dto = { insumoId: 5, activoFijoId: 2, horasEstimadas: 8 };
    const resultado = await asignarUC.ejecutar(10, dto);

    expect(resultado).toBeDefined();
    expect(resultado.id).toBe(1);
    expect(resultado.horasEstimadas).toBe(8);
    expect(resultado.insumoId).toBe(5);
  });

  it('lanza un error si las horas estimadas son menores o iguales a 0 al crear', () => {
    expect(() => {
      actividadHerramienta.crear({ actividadId: 10, insumoId: 5, horasEstimadas: 0 });
    }).toThrow('Las horas estimadas de uso deben ser mayores a 0');
  });

  it('lista las herramientas asignadas por actividad', async () => {
    await asignarUC.ejecutar(10, { insumoId: 1, horasEstimadas: 4 });
    await asignarUC.ejecutar(10, { insumoId: 2, horasEstimadas: 6 });
    await asignarUC.ejecutar(20, { insumoId: 1, horasEstimadas: 2 });

    const lista = await listarUC.ejecutar(10);
    expect(lista.length).toBe(2);
  });

  it('reestima las horas de una herramienta asignada', async () => {
    const asignada = await asignarUC.ejecutar(10, { insumoId: 3, horasEstimadas: 5 });
    const actualizada = await reestimarUC.ejecutar(asignada.id!, 10);

    expect(actualizada.horasEstimadas).toBe(10);
  });

  it('lanza NotFoundException al intentar reestimar una herramienta que no existe', async () => {
    await expect(reestimarUC.ejecutar(999, 10)).rejects.toThrow(NotFoundException);
  });

  it('quita una herramienta de la actividad de forma exitosa', async () => {
    const asignada = await asignarUC.ejecutar(10, { insumoId: 4, horasEstimadas: 3 });
    await quitarUC.ejecutar(asignada.id!);

    const lista = await listarUC.ejecutar(10);
    expect(lista.length).toBe(0);
  });

  it('lanza NotFoundException al intentar quitar una herramienta que no existe', async () => {
    await expect(quitarUC.ejecutar(999)).rejects.toThrow(NotFoundException);
  });
});