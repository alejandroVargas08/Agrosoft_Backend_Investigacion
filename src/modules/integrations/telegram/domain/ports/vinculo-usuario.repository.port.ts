import { VinculoUsuario } from '../entities/vinculo-usuario.entity';

export interface VinculoUsuarioRepositoryPort {
    buscarPorTelegramUserId(telegramUserId: string): Promise<VinculoUsuario | null>;
    buscarPorUsuarioId(usuarioId: number): Promise<VinculoUsuario | null>;
    guardar(vinculo: VinculoUsuario): Promise<VinculoUsuario>;
    eliminar(telegramUserId: string): Promise<void>;
    eliminarPorUsuarioId(usuarioId: number): Promise<void>;
}

export const VINCULO_USUARIO_REPOSITORY_PORT = Symbol('VINCULO_USUARIO_REPOSITORY_PORT');