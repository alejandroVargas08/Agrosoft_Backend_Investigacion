import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import type { UsuarioRepositoryPort } from '../../../domain/ports/usuario.repository.port';
import { PROGRAMA_FORMACION_REPOSITORY } from '../../../domain/ports/programa-formacion.repository.token';
import type { ProgramaFormacionRepositoryPort } from '../../../domain/ports/programa-formacion.repository.port';
import { ROL_REPOSITORY } from '../../../domain/ports/rol.repository.token';
import type { RolRepositoryPort } from '../../../domain/ports/rol.repository.port';
import { PerfilUsuarioResponseDto } from '../../dto/usuarios/perfil-usuario.response-dto';

@Injectable()
export class ObtenerUsuarioUseCase {
  constructor(
    @Inject('USUARIO_REPOSITORY')
    private readonly usuarioRepository: UsuarioRepositoryPort,
    @Inject(PROGRAMA_FORMACION_REPOSITORY)
    private readonly programaFormacionRepository: ProgramaFormacionRepositoryPort,
    @Inject(ROL_REPOSITORY)
    private readonly rolRepository: RolRepositoryPort,
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

    const rol = await this.rolRepository.buscarPorId(usuario.obtenerRolId());

    return {
      id: usuario.obtenerId(),
      nombre: usuario.obtenerNombre(),
      apellido: usuario.obtenerApellido(),
      identificacion: usuario.obtenerIdentificacion(),
      correo: usuario.obtenerCorreo(),
      telefono: usuario.obtenerTelefono(),
      estado: usuario.obtenerEstado(),
      correoVerificado: usuario.correoEstaVerificado(),
      rolId: usuario.obtenerRolId(),
      rol: rol ? rol.obtenerNombre() : null,
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