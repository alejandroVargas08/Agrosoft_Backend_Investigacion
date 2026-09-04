export class Notificacion {
    private constructor(
        private readonly id:number,
        private readonly usuarioId: number,
        private titulo: string,
        private mensaje: string,
        private tipo: string,
        private metadata: Record<string, any> | null, //Esto significa jsonb lo de la base de datos
        private leida:boolean,
        private creadoEn: Date,
        private actualizadoEn: Date,
        private eliminadoEn: Date | null,
    ){}
    static crear(props:{
        id: number,
        usuarioId: number,
        titulo: string,
        mensaje: string,
        tipo: string,
        metadata: Record<string, any> | null,
    }): Notificacion{
        if(!props.titulo || props.titulo.trim().length === 0){
            throw new Error('El titulo no puede estar vacío');
        }
        if(!props.mensaje || props.mensaje.trim().length === 0){
            throw new Error('El mensaje no puede estar vacío');
        }

        const ahora = new Date();

        return new Notificacion(
            props.id,
            props.usuarioId,
            props.titulo.trim(),
            props.mensaje.trim(),
            props.tipo,
            props.metadata,
            false,      // Nace leida
            ahora,      // creado
            ahora,      // actualizado
            null,       // eliminado
        );
    }
    static reconstruir(props: {
        id: number,
        usuarioId: number, 
        titulo: string,
        mensaje: string,
        tipo: string,
        metadata: Record<string, any> | null, 
        leida: boolean,
        creadoEn:Date,
        actualizadoEn: Date,
        eliminadoEn: Date | null,
    }): Notificacion{
        return new Notificacion(
            props.id,
            props.usuarioId,
            props.titulo,
            props.mensaje,
            props.tipo,
            props.metadata,
            props.leida,
            props.creadoEn,
            props.actualizadoEn,
            props.eliminadoEn,
        );
    }

    obtenerId(): number{ return this.id}
    obtenerUsuarioId(): number{ return this.usuarioId}
    obtenerTitulo(): string {return this.titulo }
    obtenerMensaje(): string{ return this.mensaje}
    obtenerTipo(): string { return this.tipo }
    obtenerMetadata(): Record<string, any> | null {return this.metadata}
    obtenerLeida(): boolean { return this.leida}
    obtenerCreadoEn(): Date { return this.creadoEn}
    obtenerActualizadoEn(): Date {return this.actualizadoEn}
    obtenerEliminadoEn(): Date | null {return this.eliminadoEn}

    marcarComoLeida(): void {
    if (this.leida) {
        throw new Error('La notificación ya está marcada como leída');
    }
    this.leida = true;
    this.actualizadoEn = new Date();
}
}