import { EliminarRolPermisoUseCase } from '../application/use-cases/rol-permisos/eliminar-rol-permiso.use-case';
import { Permiso } from '../domain/entities/permiso.entity';
import { RolPermiso } from '../domain/entities/rol-permiso.entity';
import type { PermisoRepositoryPort } from '../domain/ports/permiso.repository.port';
import type { RolPermisoRepositoryPort } from '../domain/ports/rol-permiso.repository.port';

const ROL_ADMIN = 1;
const ROL_INSTRUCTOR = 2;
const PERMISO_GESTIONAR = 10;
const PERMISO_CUALQUIERA = 11;

const permiso = (id: number, nombre: string) =>
    Permiso.reconstruir({
        id, nombre, descripcion: '', estado: 'activo',
        creadoEn: new Date(), actualizadoEn: new Date(), eliminadoEn: null,
    });

const PERMISOS = new Map([
    [PERMISO_GESTIONAR, permiso(PERMISO_GESTIONAR, 'usuarios.gestionar')],
    [PERMISO_CUALQUIERA, permiso(PERMISO_CUALQUIERA, 'cultivos.ver')],
]);

class FakeRolPermisos implements Partial<RolPermisoRepositoryPort> {
    public eliminados: Array<{ rolId: number; permisoId: number }> = [];
    constructor(private readonly existentes: Array<{ rolId: number; permisoId: number }>) {}

    async buscarPorRolYPermiso(rolId: number, permisoId: number): Promise<RolPermiso | null> {
        const hay = this.existentes.some((e) => e.rolId === rolId && e.permisoId === permisoId);
        return hay ? RolPermiso.crear({ id: 1, rolId, permisoId }) : null;
    }

    async eliminar(rolId: number, permisoId: number): Promise<void> {
        this.eliminados.push({ rolId, permisoId });
    }
}

class FakePermisos implements Partial<PermisoRepositoryPort> {
    async buscarPorId(id: number): Promise<Permiso | null> {
        return PERMISOS.get(id) ?? null;
    }
}

function construir(existentes = [
    { rolId: ROL_ADMIN, permisoId: PERMISO_GESTIONAR },
    { rolId: ROL_ADMIN, permisoId: PERMISO_CUALQUIERA },
    { rolId: ROL_INSTRUCTOR, permisoId: PERMISO_GESTIONAR },
]) {
    const repo = new FakeRolPermisos(existentes);
    const useCase = new EliminarRolPermisoUseCase(
        repo as unknown as RolPermisoRepositoryPort,
        new FakePermisos() as unknown as PermisoRepositoryPort,
    );
    return { useCase, repo };
}

describe('EliminarRolPermisoUseCase', () => {
    it('quita el permiso cuando la relación existe', async () => {
        const { useCase, repo } = construir();

        await useCase.ejecutar(ROL_INSTRUCTOR, PERMISO_GESTIONAR, ROL_ADMIN);

        expect(repo.eliminados).toEqual([{ rolId: ROL_INSTRUCTOR, permisoId: PERMISO_GESTIONAR }]);
    });

    it('falla si la relación no existe', async () => {
        const { useCase } = construir([]);

        await expect(useCase.ejecutar(ROL_ADMIN, PERMISO_GESTIONAR, ROL_ADMIN)).rejects.toThrow(/no existe/i);
    });

    it('no deja que un administrador se quite a sí mismo usuarios.gestionar', async () => {
        const { useCase, repo } = construir();

        await expect(
            useCase.ejecutar(ROL_ADMIN, PERMISO_GESTIONAR, ROL_ADMIN),
        ).rejects.toThrow(/perderías el acceso/i);

        expect(repo.eliminados).toEqual([]);
    });

    it('sí deja quitarse otros permisos de su propio rol', async () => {
        const { useCase, repo } = construir();

        await useCase.ejecutar(ROL_ADMIN, PERMISO_CUALQUIERA, ROL_ADMIN);

        expect(repo.eliminados).toEqual([{ rolId: ROL_ADMIN, permisoId: PERMISO_CUALQUIERA }]);
    });

    it('sin rol del solicitante no aplica el bloqueo', async () => {
        const { useCase, repo } = construir();

        await useCase.ejecutar(ROL_ADMIN, PERMISO_GESTIONAR);

        expect(repo.eliminados).toEqual([{ rolId: ROL_ADMIN, permisoId: PERMISO_GESTIONAR }]);
    });
});
