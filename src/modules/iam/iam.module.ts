import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsuarioOrmEntity } from './infrastructure/persistence/entities/usuario.orm-entity';
import { UsuarioRepository } from './infrastructure/persistence/repositories/usuario.repository';
import { UsuarioController } from './infrastructure/http/controllers/usuarios.controller';

import { CrearUsuarioUseCase } from './application/use-cases/usuarios/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/usuarios/actualizar-usuario.use-case';
import { LoginUsuarioUseCase } from './application/use-cases/usuarios/login-usuario.use-case';
import { EliminarUsuarioUseCase } from './application/use-cases/usuarios/eliminar-usuario.use-case';

// Importa el token desde el dominio
import { USUARIO_REPOSITORY } from './domain/ports/usuario.repository.token';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
  ],
  controllers: [UsuarioController],
  providers: [
    CrearUsuarioUseCase,
    ActualizarUsuarioUseCase,
    LoginUsuarioUseCase,
    EliminarUsuarioUseCase,
    {
      provide: USUARIO_REPOSITORY, 
      useClass: UsuarioRepository,
    },
  ],
  exports: [USUARIO_REPOSITORY],
})
export class IamModule {}