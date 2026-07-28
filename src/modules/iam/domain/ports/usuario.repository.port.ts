import { Usuario } from "../entities/usuario.entity";


export interface UsuarioRepositoryPort{
    guardar(Usuario:Usuario): Promise<void>;
    buscarPorId(id:string): Promise<Usuario| null>;
    buscarPorEmail(Email: string): Promise<Usuario | null>;
    listar():Promise<Usuario[]>;
    eliminarId(id: string): Promise<void>;
}