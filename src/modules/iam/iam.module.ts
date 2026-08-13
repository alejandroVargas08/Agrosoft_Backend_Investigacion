import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//Usuario
import { UsuarioOrmEntity } from './infrastructure/persistence/entities/usuario.orm-entity';
import { UsuarioRepository } from './infrastructure/persistence/repositories/usuario.repository';
import { UsuarioController } from './infrastructure/http/controllers/usuarios.controller';
import { CrearUsuarioUseCase } from './application/use-cases/usuarios/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/usuarios/actualizar-usuario.use-case';
import { LoginUsuarioUseCase } from './application/use-cases/usuarios/login-usuario.use-case';
import { EliminarUsuarioUseCase } from './application/use-cases/usuarios/eliminar-usuario.use-case';
import { USUARIO_REPOSITORY } from './domain/ports/usuario.repository.token';

// Rol 
import { RolOrmEntity } from './infrastructure/persistence/entities/rol.orm-entity';
import { RolRepository } from './infrastructure/persistence/repositories/rol.repository';
import { RolController } from './infrastructure/http/controllers/roles.controller';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.token';

// Permiso 
import { PermisoOrmEntity } from './infrastructure/persistence/entities/permiso.orm-entity';
import { PermisoRepository } from './infrastructure/persistence/repositories/permiso.repository';
import { PermisoController } from './infrastructure/http/controllers/permisos.controller';
import { PERMISO_REPOSITORY } from './domain/ports/permiso.repository.token';

//Rol Permiso
import { RolPermisoOrmEntity } from './infrastructure/persistence/entities/rol-permiso.orm-entity';
import { RolPermisoRepository } from './infrastructure/persistence/repositories/rol-permiso.repository';
import { RolPermisosController } from './infrastructure/http/controllers/rol-permisos.controller';
import { AsignarRolPermisoUseCase } from './application/use-cases/rol-permisos/asignar-rol-permiso.use-case';
import { ListarPermisosPorRolUseCase } from './application/use-cases/rol-permisos/listar-permisos-por-rol.use-case';
import { EliminarRolPermisoUseCase } from './application/use-cases/rol-permisos/eliminar-rol-permiso.use-case';
import { ROL_PERMISO_REPOSITORY } from './domain/ports/rol-permiso.repository.token';

//Usuario Permiso 
import { UsuarioPermisoOrmEntity } from './infrastructure/persistence/entities/usuario-permiso.orm-entity';
import { UsuarioPermisoRepository } from './infrastructure/persistence/repositories/usuario-permiso.repository';
import { UsuarioPermisoController } from './infrastructure/http/controllers/usuario-permisos.controller';
import { AsignarUsuarioPermisoUseCase } from './application/use-cases/usuario-permisos/asignar-usuario-permiso.use-case';
import { ListarPermisosPorUsuarioUseCase } from './application/use-cases/usuario-permisos/listar-permisos-por-usuario.use-case';
import { EliminarUsuarioPermisoUseCase } from './application/use-cases/usuario-permisos/eliminar-usuario-permiso.use-case';
import { USUARIO_PERMISO_REPOSITORY } from './domain/ports/usuario-permiso.repository.token';


//Esto hace parte a lo del rol
import { CrearRolUseCase } from './application/use-cases/roles/crear-rol.use-case';
import { ListarRolesUseCase } from './application/use-cases/roles/listar-roles.use-case';
import { ActualizarRolUseCase } from './application/use-cases/roles/actualizar-rol.use-case';
import { EliminarRolUseCase } from './application/use-cases/roles/eliminar-rol.use-case';

import { CrearPermisoUseCase } from './application/use-cases/permisos/crear-permiso.use-case';
import { ActualizarPermisoUseCase } from './application/use-cases/permisos/actualizar-permiso.use-case';
import { EliminarPermisoUseCase } from './application/use-cases/permisos/eliminar-permiso.use-case';
import { ListarPermisosUseCase } from './application/use-cases/permisos/listar-permisos.use-case';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioOrmEntity,
      RolOrmEntity,
      PermisoOrmEntity,
      RolPermisoOrmEntity,
      UsuarioPermisoOrmEntity,
    ]),
  ],
  controllers: [
    UsuarioController,
    RolController,
    PermisoController,
    RolPermisosController,
    UsuarioPermisoController,
  ],
  providers: [
    // Usuario
    CrearUsuarioUseCase,
    ActualizarUsuarioUseCase,
    LoginUsuarioUseCase,
    EliminarUsuarioUseCase,
    { provide: USUARIO_REPOSITORY, useClass: UsuarioRepository },

    // Rol
    CrearRolUseCase,
    ListarRolesUseCase,
    ActualizarRolUseCase,
    EliminarRolUseCase,
    { provide: ROL_REPOSITORY, useClass: RolRepository },

    // Permiso
    CrearPermisoUseCase,
    ActualizarPermisoUseCase,
    EliminarPermisoUseCase,
    ListarPermisosUseCase,
    { provide: PERMISO_REPOSITORY, useClass: PermisoRepository },

    // RolPermiso
    AsignarRolPermisoUseCase,
    ListarPermisosPorRolUseCase,
    EliminarRolPermisoUseCase,
    { provide: ROL_PERMISO_REPOSITORY, useClass: RolPermisoRepository },

    // UsuarioPermiso
    AsignarUsuarioPermisoUseCase,
    ListarPermisosPorUsuarioUseCase,
    EliminarUsuarioPermisoUseCase,
    { provide: USUARIO_PERMISO_REPOSITORY, useClass: UsuarioPermisoRepository },
  ],
  exports: [USUARIO_REPOSITORY, ROL_REPOSITORY, PERMISO_REPOSITORY],
})
export class IamModule {}