import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { PerfilUsuarioResponseDto } from '../../dto/usuarios/perfil-usuario.response-dto';

@Injectable()
export class ObtenerUsuarioUseCase {
  constructor(
    @Inject('USUARIO_REPOSITORY')
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly programaFormacionRepository: ProgramaFormacionRepositoryPort,
  ) {}

  async ejecutar(id: number): Promise<PerfilUsuarioResponseDto> {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const programaFormacionId = usuario.obtenerProgramaFormacionId();
    const programa = programaFormacionId
      ? await this.programaFormacionRepository.buscarPorId(programaFormacionId)
      : null;

    return {
      id: usuario.obtenerId(),
      nombre: usuario.obtenerNombre(),
      apellido: usuario.obtenerApellido(),
      email: usuario.obtenerCorreo(),
      telefono: usuario.obtenerTelefono(),
      rolId: usuario.obtenerRolId(),
      programaFormacion: programa
        ? {
            nombre: programa.obtenerNombre(),
            tipo: programa.obtenerTipo(),
            ficha: programa.obtenerFicha(),
            fechaInicio: programa.obtenerFechaInicio(),
            fechaFin: programa.obtenerFechaFin(),
            estado: programa.obtenerEstado(),
          }
        : null,
    };
  }
}