import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { registrarUsoHerramientaUseCase } from '../application/use-cases/registrar-uso-herramienta.use-case';
import { listarUsoHerramientasUseCase } from '../application/use-cases/listar-uso-herramienta.use-case';
import { uso_HerramientaRepository, usoHerramientaRepositoryPort } from '../domain/ports/uso-herramienta.repository.port';
import { usoHerramienta } from '../domain/entities/uso-herramienta.entity';

describe('Pruebas del Módulo Usos Herramientas', () => {
  let registrarUC: registrarUsoHerramientaUseCase;
  let listarUC: listarUsoHerramientasUseCase;
  let mockRepo: jest.Mocked<usoHerramientaRepositoryPort>;

  beforeEach(async () => {
    // Creamos el repositorio falso con sus métodos mockeados
    const repositoryMock = {
      crear: jest.fn(),
      listarPorActividad: jest.fn(),
      obtenerUltimoValorLibros: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        registrarUsoHerramientaUseCase,
        listarUsoHerramientasUseCase,
        {
          provide: uso_HerramientaRepository, // Usando tu token correcto
          useValue: repositoryMock,
        },
      ],
    }).compile();

    registrarUC = module.get<registrarUsoHerramientaUseCase>(registrarUsoHerramientaUseCase);
    listarUC = module.get<listarUsoHerramientasUseCase>(listarUsoHerramientasUseCase);
    mockRepo = module.get(uso_HerramientaRepository);
  });

  it('debe estar definido', () => {
    expect(registrarUC).toBeDefined();
    expect(listarUC).toBeDefined();
  });

  it('lanza BadRequestException si no se indica valorLibrosAntes y no hay historial previo', async () => {
    mockRepo.obtenerUltimoValorLibros.mockResolvedValue(null);

    const dto = {
      insumoId: 1,
      horasUsadas: 5,
      tasaDepreciacionHora: 10,
      valorLibrosAntes: undefined as any,
    };

    await expect(registrarUC.ejecutar(1, dto)).rejects.toThrow(BadRequestException);
    expect(mockRepo.obtenerUltimoValorLibros).toHaveBeenCalledWith(1);
  });

  it('calcula la depreciación y registra el uso exitosamente usando el historial previo', async () => {
    mockRepo.obtenerUltimoValorLibros.mockResolvedValue(1000);
    mockRepo.crear.mockImplementation(async (item) => item as any);

    const dto = {
      insumoId: 1,
      horasUsadas: 10,
      tasaDepreciacionHora: 20,
      valorLibrosAntes: undefined as any,
    };

    const resultado = await registrarUC.ejecutar(1, dto);

    expect(resultado.valorLibrosAntes).toBe(1000);
    expect(resultado.depreciacionGenerada).toBe(200);
    expect(resultado.valorLibrosDespues).toBe(800);
    expect(mockRepo.crear).toHaveBeenCalled();
  });

  it('lista los usos de herramientas por actividad exitosamente', async () => {
    const listaFalsa = [
      new usoHerramienta(1, 1, 1, 5, 50, 500, 450, new Date()),
    ];
    mockRepo.listarPorActividad.mockResolvedValue(listaFalsa);

    const resultado = await listarUC.ejecutar(1);

    expect(resultado).toEqual(listaFalsa);
    expect(mockRepo.listarPorActividad).toHaveBeenCalledWith(1);
  });
});