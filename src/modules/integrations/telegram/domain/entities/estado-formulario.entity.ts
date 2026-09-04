export enum EstadoConversacion {
    ACTIVO = 'activo',
    COMPLETADO = 'completado',
    CANCELADO = 'cancelado',
    }

    export interface EstadoFormularioPropiedades {
    id?: number;
    telegramUserId: string;
    step: string;
    data: Record<string, unknown>;
    estado: EstadoConversacion;
    accessToken?: string;
    updatedAt?: Date;
    }

    export class EstadoFormulario {
    private _id?: number;
    private _telegramUserId: string;
    private _step: string;
    private _data: Record<string, unknown>;
    private _estado: EstadoConversacion;
    private _accessToken?: string;
    private _updatedAt?: Date;

    private constructor(props: EstadoFormularioPropiedades) {
        this._id = props.id;
        this._telegramUserId = props.telegramUserId;
        this._step = props.step;
        this._data = props.data;
        this._estado = props.estado;
        this._accessToken = props.accessToken;
        this._updatedAt = props.updatedAt;
    }

    static iniciar(telegramUserId: string, primerStep: string): EstadoFormulario {
        if (!telegramUserId?.trim()) {
        throw new Error('El id de usuario de Telegram es requerido');
        }
        return new EstadoFormulario({
        telegramUserId,
        step: primerStep,
        data: {},
        estado: EstadoConversacion.ACTIVO,
        });
    }

    static reconstruir(props: Required<Pick<EstadoFormularioPropiedades, 'id'>> & EstadoFormularioPropiedades): EstadoFormulario {
        return new EstadoFormulario(props);
    }

    avanzarA(siguienteStep: string, datosNuevos: Record<string, unknown>): void {
        if (this._estado !== EstadoConversacion.ACTIVO) {
        throw new Error('No se puede avanzar una conversación que no está activa');
        }
        this._step = siguienteStep;
        this._data = { ...this._data, ...datosNuevos };
        this._updatedAt = new Date();
    }

    completar(): void {
        this._estado = EstadoConversacion.COMPLETADO;
        this._updatedAt = new Date();
    }

    cancelar(): void {
        this._estado = EstadoConversacion.CANCELADO;
        this._updatedAt = new Date();
    }

    asignarAccessToken(token: string): void {
        this._accessToken = token;
    }

    estaActiva(): boolean {
        return this._estado === EstadoConversacion.ACTIVO;
    }

    get id() { return this._id; }
    get telegramUserId() { return this._telegramUserId; }
    get step() { return this._step; }
    get data() { return this._data; }
    get estado() { return this._estado; }
    get accessToken() { return this._accessToken; }
}
