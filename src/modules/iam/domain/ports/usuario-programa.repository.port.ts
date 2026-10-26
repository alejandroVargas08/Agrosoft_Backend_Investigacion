export interface UsuarioProgramaRepositoryPort {
  asignar(usuarioId: number, programaFormacionId: number): Promise<void>;
  quitar(usuarioId: number, programaFormacionId: number): Promise<void>;
  listarProgramasDeUsuario(usuarioId: number): Promise<number[]>;
  existe(usuarioId: number, programaFormacionId: number): Promise<boolean>;
  listarTodas(): Promise<{ usuarioId: number; programaFormacionId: number }[]>;
}
