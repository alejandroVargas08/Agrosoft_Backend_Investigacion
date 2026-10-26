import { NovedadesUseCase } from '../application/use-cases/novedades.use-case';
import { EstadoNovedad, Novedad } from '../domain/entities/novedad.entity';
import type { NovedadRepositoryPort } from '../domain/ports/novedad.repository.port';
import type { AccesoAprendicesService } from '../../../modules/iam/application/services/acceso-aprendices.service';
import { Usuario } from '../../../modules/iam/domain/entities/usuario.entity';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { ReportarNovedadDto } from '../application/dtos/novedad.dto';

const APRENDIZ = 5;
const OTRO_APRENDIZ = 6;
const INSTRUCTOR = 9;

const sesion = (id: number): UsuarioAutenticado => ({
    id, correo: `u${id}@sena.edu.co`, rolId: 1, permisos: [],
    verTodo: true, programasPermitidos: [],
});

const usuario = (id: number, nombre: string, apellido: string): Usuario =>
    Usuario.reconstruir({
        id, nombre, apellido, identificacion: String(id), idFicha: null,
        programaFormacionId: 10, telefono: '300', correo: `u${id}@sena.edu.co`,
        contrasenaHash: 'h', correoVerificadoEn: null, estado: 'activo',
        lastLoginAt: null, avatarUrl: null, rolId: 7,
        creadoEn: new Date(), actualizadoEn: new Date(), eliminadoEn: null,
    });

const novedad = (id: number, autor: number, estado: EstadoNovedad = 'pendiente') =>
    new Novedad(id, 'otro', 'medium', estado, 'Se rompió la manguera del lote 2',
        autor, null, null, null, null, null, null, new Date());

class FakeRepo implements Partial<NovedadRepositoryPort> {
    public guardadas: Novedad[] = [];
    public autoresPedidos: number[][] = [];
    constructor(private readonly existentes: Novedad[] = []) {}

    async crear(n: Novedad): Promise<Novedad> {
        this.guardadas.push(n);
        return n;
    }
    async buscarPorId(id: number): Promise<Novedad | null> {
        return this.existentes.find((n) => n.id === id) ?? null;
    }
    async listarPorAutor(usuarioId: number): Promise<Novedad[]> {
        return this.existentes.filter((n) => n.reportadaPorUsuarioId === usuarioId);
    }
    async listarPorAutores(usuarioIds: number[]): Promise<Novedad[]> {
        this.autoresPedidos.push(usuarioIds);
        return this.existentes.filter((n) => usuarioIds.includes(n.reportadaPorUsuarioId));
    }
    async actualizar(n: Novedad): Promise<Novedad> {
        this.guardadas.push(n);
        return n;
    }
}

/** Solo APRENDIZ está a cargo del instructor; OTRO_APRENDIZ no. */
const fakeAcceso = (): AccesoAprendicesService =>
    ({
        async listar() {
            return [usuario(APRENDIZ, 'Ana', 'Lopez')];
        },
        async idsVisibles() {
            return [APRENDIZ];
        },
        async puedeVer(_alcance: unknown, id: number) {
            return id === APRENDIZ;
        },
    }) as unknown as AccesoAprendicesService;

const construir = (existentes: Novedad[] = []) => {
    const repo = new FakeRepo(existentes);
    return {
        repo,
        useCase: new NovedadesUseCase(repo as unknown as NovedadRepositoryPort, fakeAcceso()),
    };
};

const DTO: ReportarNovedadDto = {
    tipo: 'otro', urgencia: 'medium',
    descripcion: 'Se rompió la manguera del lote 2',
};

describe('NovedadesUseCase', () => {
    describe('reportar', () => {
        it('guarda la novedad como pendiente y con el autor de la sesión', async () => {
            const { useCase, repo } = construir();

            await useCase.reportar(DTO, sesion(APRENDIZ));

            expect(repo.guardadas).toHaveLength(1);
            expect(repo.guardadas[0].estado).toBe('pendiente');
            expect(repo.guardadas[0].reportadaPorUsuarioId).toBe(APRENDIZ);
        });

        it('exige el insumo cuando el tipo es insumo_bajo', async () => {
            const { useCase } = construir();

            await expect(
                useCase.reportar({ ...DTO, tipo: 'insumo_bajo' }, sesion(APRENDIZ)),
            ).rejects.toThrow(/insumo/i);
        });

        it('exige el nombre cuando el tipo es herramienta_danada', async () => {
            const { useCase } = construir();

            await expect(
                useCase.reportar({ ...DTO, tipo: 'herramienta_danada' }, sesion(APRENDIZ)),
            ).rejects.toThrow(/herramienta/i);
        });
    });

    describe('deMisAprendices', () => {
        it('solo pide las de los aprendices a cargo, en una consulta', async () => {
            const { useCase, repo } = construir([
                novedad(1, APRENDIZ),
                novedad(2, OTRO_APRENDIZ),
            ]);

            const lista = await useCase.deMisAprendices(sesion(INSTRUCTOR));

            expect(repo.autoresPedidos).toEqual([[APRENDIZ]]);
            expect(lista.map((n) => n.id)).toEqual([1]);
        });

        it('trae el nombre de quien la reportó', async () => {
            const { useCase } = construir([novedad(1, APRENDIZ)]);

            const [primera] = await useCase.deMisAprendices(sesion(INSTRUCTOR));

            expect(primera.reportadaPor).toEqual({ id: APRENDIZ, nombre: 'Ana', apellido: 'Lopez' });
        });
    });

    describe('atender y descartar', () => {
        it('atender la marca atendida y guarda la respuesta', async () => {
            const { useCase, repo } = construir([novedad(1, APRENDIZ)]);

            await useCase.atender(1, { respuesta: 'Ya pedí la manguera' }, sesion(INSTRUCTOR));

            const guardada = repo.guardadas[0];
            expect(guardada.estado).toBe('atendida');
            expect(guardada.respuestaInstructor).toBe('Ya pedí la manguera');
            expect(guardada.respondidaPorUsuarioId).toBe(INSTRUCTOR);
            expect(guardada.respondidaEn).not.toBeNull();
        });

        it('descartar la marca descartada', async () => {
            const { useCase, repo } = construir([novedad(1, APRENDIZ)]);

            await useCase.descartar(1, { respuesta: 'No corresponde a esta ficha' }, sesion(INSTRUCTOR));

            expect(repo.guardadas[0].estado).toBe('descartada');
        });

        it('no deja resolver dos veces', async () => {
            const { useCase } = construir([novedad(1, APRENDIZ, 'atendida')]);

            await expect(
                useCase.atender(1, { respuesta: 'otra vez' }, sesion(INSTRUCTOR)),
            ).rejects.toThrow(/ya fue resuelta/i);
        });

        it('exige una respuesta no vacía', async () => {
            const { useCase } = construir([novedad(1, APRENDIZ)]);

            await expect(
                useCase.atender(1, { respuesta: '   ' }, sesion(INSTRUCTOR)),
            ).rejects.toThrow(/respuesta/i);
        });

        it('no deja resolver la de un aprendiz de otra ficha', async () => {
            const { useCase } = construir([novedad(1, OTRO_APRENDIZ)]);

            await expect(
                useCase.atender(1, { respuesta: 'listo' }, sesion(INSTRUCTOR)),
            ).rejects.toThrow(/no encontrada/i);
        });

        it('falla si la novedad no existe', async () => {
            const { useCase } = construir([]);

            await expect(
                useCase.atender(99, { respuesta: 'listo' }, sesion(INSTRUCTOR)),
            ).rejects.toThrow(/no encontrada/i);
        });
    });

    describe('mias', () => {
        it('devuelve solo las del usuario en sesión', async () => {
            const { useCase } = construir([novedad(1, APRENDIZ), novedad(2, OTRO_APRENDIZ)]);

            const lista = await useCase.mias(sesion(APRENDIZ));

            expect(lista.map((n) => n.id)).toEqual([1]);
        });
    });
});
