import { ResumenAprendicesUseCase } from "../aplicattion/use-cases/asignaciones/resumen-aprendices.use-case";
import { ActividadAsignacion, EstadoAsignacion } from "../domain/entities/actividad-asignacion.entity";
import type { ActividadAsignacionesRepositoryPort } from "../domain/ports/actividad-asignaciones.repository.port";
import { Rol } from "../../../modules/iam/domain/entities/rol.entity";
import { Usuario } from "../../../modules/iam/domain/entities/usuario.entity";
import type { AccesoAprendicesService } from "../../../modules/iam/application/services/acceso-aprendices.service";
import type { AlcanceDatos } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";
import type { AccesoActividadesService } from "../aplicattion/services/acceso-actividades.service";
import type { PresentadorAsignacionesService } from "../aplicattion/services/presentador-asignaciones.service";

const ROL_APRENDIZ = 7;
const ROL_INSTRUCTOR = 8;
const AYER = new Date(Date.now() - 86400000);
const MANANA = new Date(Date.now() + 86400000);

const rolAprendiz = Rol.reconstruir({
    id: ROL_APRENDIZ, nombre: 'Aprendiz', descripcion: '', esSistema: true,
    estado: 'activo', creadoEn: new Date(), actualizadoEn: new Date(), eliminadoEn: null,
});

function usuario(id: number, apellido: string, rolId: number, programaFormacionId: number | null, ultimoIngreso: Date | null = null): Usuario {
    return Usuario.reconstruir({
        id, nombre: 'Nombre' + id, apellido, identificacion: String(1000 + id),
        idFicha: null, programaFormacionId, telefono: '300', correo: `u${id}@sena.edu.co`,
        contrasenaHash: 'hash', correoVerificadoEn: null, estado: 'activo',
        lastLoginAt: ultimoIngreso, avatarUrl: null, rolId,
        creadoEn: new Date(), actualizadoEn: new Date(), eliminadoEn: null,
    });
}

function asignacion(
    id: number, actividadId: number, aprendizId: number, estado: EstadoAsignacion,
    opciones: { horas?: number | null; fechaLimite?: Date | null } = {},
): ActividadAsignacion {
    return ActividadAsignacion.desdePersistencia({
        id, actividadId, aprendizId, asignadoPorId: 99, estado,
        fechaLimite: opciones.fechaLimite ?? null,
        horasTrabajadas: opciones.horas ?? null,
        comentarioAprendiz: null, comentarioInstructor: null,
        iniciadaEn: null, entregadaEn: null, revisadaEn: null, revisadaPorId: null,
    });
}

/**
 * Replica la regla real del servicio de iam: rol Aprendiz, activo, con
 * programa, y el programa dentro del alcance.
 */
class FakeAccesoAprendices {
    constructor(private readonly usuarios: Usuario[], private readonly rol: Rol | null) {}

    async listar(alcance: AlcanceDatos, programaFormacionId?: number): Promise<Usuario[]> {
        if (!this.rol) return [];
        const rolId = this.rol.obtenerId();
        return this.usuarios
            .filter((u) => u.estaActivo() && u.obtenerRolId() === rolId)
            .filter((u) => {
                const programa = u.obtenerProgramaFormacionId();
                if (programa === null) return false;
                if (programaFormacionId !== undefined && programa !== programaFormacionId) return false;
                return alcance.verTodo || alcance.programasPermitidos.includes(programa);
            })
            .sort((a, b) =>
                `${a.obtenerApellido()} ${a.obtenerNombre()}`.localeCompare(
                    `${b.obtenerApellido()} ${b.obtenerNombre()}`, 'es'),
            );
    }

    async idsVisibles(alcance: AlcanceDatos): Promise<number[]> {
        return (await this.listar(alcance)).map((u) => u.obtenerId());
    }
}

class FakeAsignaciones implements Partial<ActividadAsignacionesRepositoryPort> {
    public pedidos: number[][] = [];
    constructor(private readonly asignaciones: ActividadAsignacion[]) {}
    async listarPorAprendices(aprendizIds: number[]): Promise<ActividadAsignacion[]> {
        this.pedidos.push(aprendizIds);
        return this.asignaciones.filter((a) => aprendizIds.includes(a.aprendizId));
    }
}

/** Deja ver solo las actividades de la lista. */
function fakeAcceso(actividadesVisibles: number[]): AccesoActividadesService {
    return {
        async obtenerActividadVisible(id: number) {
            if (!actividadesVisibles.includes(id)) throw new Error('no visible');
            return {} as never;
        },
    } as unknown as AccesoActividadesService;
}

/** Solo necesita devolver algo identificable por asignación. */
function fakePresentador(): PresentadorAsignacionesService {
    return {
        async presentar(asignaciones: ActividadAsignacion[]) {
            return asignaciones.map((a) => ({ id: a.id, estado: a.estado }));
        },
    } as unknown as PresentadorAsignacionesService;
}

function construir(
    usuarios: Usuario[],
    asignaciones: ActividadAsignacion[],
    actividadesVisibles: number[],
    rol: Rol | null = rolAprendiz,
) {
    const repoAsignaciones = new FakeAsignaciones(asignaciones);
    // Los fakes solo implementan los metodos que el caso de uso usa
    const useCase = new ResumenAprendicesUseCase(
        repoAsignaciones as unknown as ActividadAsignacionesRepositoryPort,
        fakeAcceso(actividadesVisibles),
        new FakeAccesoAprendices(usuarios, rol) as unknown as AccesoAprendicesService,
        fakePresentador(),
    );
    return { useCase, repoAsignaciones };
}

const VE_TODO: AlcanceDatos = { verTodo: true, programasPermitidos: [] };

describe('ResumenAprendicesUseCase', () => {
    it('cuenta tareas, aprobadas, entregadas y horas de cada aprendiz', async () => {
        const { useCase } = construir(
            [usuario(1, 'Lopez', ROL_APRENDIZ, 10)],
            [
                asignacion(1, 100, 1, 'APROBADA', { horas: 4 }),
                asignacion(2, 100, 1, 'APROBADA', { horas: 2.5 }),
                asignacion(3, 101, 1, 'ENTREGADA', { horas: 3 }),
                asignacion(4, 101, 1, 'ASIGNADA'),
            ],
            [100, 101],
        );

        const [resumen] = await useCase.ejecutar(VE_TODO);

        expect(resumen.tareas).toBe(4);
        expect(resumen.aprobadas).toBe(2);
        expect(resumen.entregadas).toBe(1);
        expect(resumen.horas).toBe(9.5);
    });

    it('solo cuenta vencidas las que siguen activas con el plazo pasado', async () => {
        const { useCase } = construir(
            [usuario(1, 'Lopez', ROL_APRENDIZ, 10)],
            [
                asignacion(1, 100, 1, 'ASIGNADA', { fechaLimite: AYER }),    // vencida
                asignacion(2, 100, 1, 'DEVUELTA', { fechaLimite: AYER }),    // vencida
                asignacion(3, 100, 1, 'ENTREGADA', { fechaLimite: AYER }),   // ya entregó: no cuenta
                asignacion(4, 100, 1, 'APROBADA', { fechaLimite: AYER }),    // ya aprobada: no cuenta
                asignacion(5, 100, 1, 'ASIGNADA', { fechaLimite: MANANA }),  // todavía tiene plazo
            ],
            [100],
        );

        const [resumen] = await useCase.ejecutar(VE_TODO);

        expect(resumen.vencidas).toBe(2);
        expect(resumen.tareas).toBe(5);
    });

    it('ignora las asignaciones de actividades que el instructor no puede ver', async () => {
        const { useCase } = construir(
            [usuario(1, 'Lopez', ROL_APRENDIZ, 10)],
            [
                asignacion(1, 100, 1, 'APROBADA', { horas: 4 }),
                asignacion(2, 999, 1, 'APROBADA', { horas: 8 }), // actividad de otra ficha
            ],
            [100],
        );

        const [resumen] = await useCase.ejecutar(VE_TODO);

        expect(resumen.tareas).toBe(1);
        expect(resumen.horas).toBe(4);
    });

    it('deja fuera a quien no es aprendiz, no tiene programa, o es de otra ficha', async () => {
        const { useCase } = construir(
            [
                usuario(1, 'Lopez', ROL_APRENDIZ, 10),
                usuario(2, 'Diaz', ROL_INSTRUCTOR, 10),   // no es aprendiz
                usuario(3, 'Mora', ROL_APRENDIZ, null),   // sin programa
                usuario(4, 'Ruiz', ROL_APRENDIZ, 20),     // ficha fuera del alcance
            ],
            [],
            [],
        );

        const resumen = await useCase.ejecutar({ verTodo: false, programasPermitidos: [10] });

        expect(resumen.map((r) => r.id)).toEqual([1]);
    });

    it('filtra por ficha cuando se pide una en concreto', async () => {
        const { useCase } = construir(
            [usuario(1, 'Lopez', ROL_APRENDIZ, 10), usuario(2, 'Diaz', ROL_APRENDIZ, 20)],
            [],
            [],
        );

        const resumen = await useCase.ejecutar(VE_TODO, 20);

        expect(resumen.map((r) => r.id)).toEqual([2]);
    });

    it('pide las asignaciones de todos los aprendices en una sola consulta', async () => {
        const { useCase, repoAsignaciones } = construir(
            [usuario(1, 'Lopez', ROL_APRENDIZ, 10), usuario(2, 'Diaz', ROL_APRENDIZ, 10)],
            [],
            [],
        );

        await useCase.ejecutar(VE_TODO);

        expect(repoAsignaciones.pedidos).toHaveLength(1);
        expect(repoAsignaciones.pedidos[0].sort()).toEqual([1, 2]);
    });

    it('ordena por apellido', async () => {
        const { useCase } = construir(
            [usuario(1, 'Zapata', ROL_APRENDIZ, 10), usuario(2, 'Alvarez', ROL_APRENDIZ, 10)],
            [],
            [],
        );

        const resumen = await useCase.ejecutar(VE_TODO);

        expect(resumen.map((r) => r.apellido)).toEqual(['Alvarez', 'Zapata']);
    });

    it('devuelve vacío si no existe el rol Aprendiz', async () => {
        const { useCase } = construir([usuario(1, 'Lopez', ROL_APRENDIZ, 10)], [], [], null);

        expect(await useCase.ejecutar(VE_TODO)).toEqual([]);
    });

    it('trae los datos de contacto, que el instructor no puede leer de GET /usuarios/:id', async () => {
        const { useCase } = construir([usuario(1, 'Lopez', ROL_APRENDIZ, 10)], [], []);

        const [resumen] = await useCase.ejecutar(VE_TODO);

        expect(resumen.identificacion).toBe('1001');
        expect(resumen.telefono).toBe('300');
        expect(resumen.correo).toBe('u1@sena.edu.co');
    });

    describe('tareasDeAprendiz', () => {
        it('devuelve solo las tareas de actividades visibles', async () => {
            const { useCase } = construir(
                [usuario(1, 'Lopez', ROL_APRENDIZ, 10)],
                [
                    asignacion(1, 100, 1, 'APROBADA'),
                    asignacion(2, 999, 1, 'APROBADA'), // actividad de otra ficha
                ],
                [100],
            );

            const tareas = await useCase.tareasDeAprendiz(1, VE_TODO);

            expect(tareas.map((t) => t.id)).toEqual([1]);
        });

        it('rechaza un aprendiz que no está en el alcance del instructor', async () => {
            const { useCase } = construir(
                [usuario(1, 'Lopez', ROL_APRENDIZ, 10), usuario(2, 'Ruiz', ROL_APRENDIZ, 20)],
                [asignacion(1, 100, 2, 'APROBADA')],
                [100],
            );

            await expect(
                useCase.tareasDeAprendiz(2, { verTodo: false, programasPermitidos: [10] }),
            ).rejects.toThrow(/no encontrado/i);
        });
    });
});
