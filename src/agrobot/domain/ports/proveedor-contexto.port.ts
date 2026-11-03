import type { UsuarioAutenticado } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";

export type FuenteContexto = 'sensores' | 'inventario' | 'drones';

export interface ProveedorContextoPort{
    readonly fuente: FuenteContexto;
    obtener(usuario: UsuarioAutenticado): Promise<string>;
}

export const PROVEEDORES_CONTEXTO_TOKEN= 'PROVEEDORES_CONTEXTO_PORT';
