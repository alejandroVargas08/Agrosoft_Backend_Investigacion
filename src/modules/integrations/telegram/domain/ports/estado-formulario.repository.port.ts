import { EstadoFormulario } from '../entities/estado-formulario.entity';

export interface EstadoFormularioRepositoryPort {
    buscarPorTelegramUserId(telegramUserId: string): Promise<EstadoFormulario | null>;
    guardar(estadoFormulario: EstadoFormulario): Promise<EstadoFormulario>;
}

export const ESTADO_FORMULARIO_REPOSITORY_PORT = Symbol('ESTADO_FORMULARIO_REPOSITORY_PORT');