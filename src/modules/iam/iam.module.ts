import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioOrmEntity } from './infrastructure/persistence/entities/usuario.orm-entity';
import { UsuarioRepository } from './infrastructure/persistence/repositories/usuario.repository';
import { UsuarioController } from './infrastructure/http/controllers/usuarios.controller';

import { RolOrmEntity } from './infrastructure/persistence/entities/rol.orm-entity';
import { RolRepository } from './infrastructure/persistence/repositories/rol.repository';
import { RolController } from './infrastructure/http/controllers/roles.controller';

import { CrearUsuarioUseCase } from './application/use-cases/usuarios/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/usuarios/actualizar-usuario.use-case';
import { LoginUsuarioUseCase } from './application/use-cases/usuarios/login-usuario.use-case';
import { EliminarUsuarioUseCase } from './application/use-cases/usuarios/eliminar-usuario.use-case';

import { CrearRolUseCase } from './application/use-cases/roles/crear-rol.use-case';
import { ListarRolesUseCase } from './application/use-cases/roles/listar-roles.use-case';
import { ActualizarRolUseCase } from './application/use-cases/roles/actualizar-rol.use-case';
import { EliminarRolUseCase } from './application/use-cases/roles/eliminar-rol.use-case';

import { USUARIO_REPOSITORY } from './domain/ports/usuario.repository.token';
import { ROL_REPOSITORY } from './domain/ports/rol.repository.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity, RolOrmEntity]),
  ],
  controllers: [UsuarioController, RolController],
  providers: [
    // Usuarios
    CrearUsuarioUseCase,
    ActualizarUsuarioUseCase,
    LoginUsuarioUseCase,
    EliminarUsuarioUseCase,
    {
      provide: USUARIO_REPOSITORY,
      useClass: UsuarioRepository,
    },
    // Roles
    CrearRolUseCase,
    ListarRolesUseCase,
    ActualizarRolUseCase,
    EliminarRolUseCase,
    {
      provide: ROL_REPOSITORY,
      useClass: RolRepository,
    },
  ],
  exports: [USUARIO_REPOSITORY, ROL_REPOSITORY],
})
export class IamModule {}