import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioOrmEntity } from './infrastructure/persistence/entities/usuario.orm-entity';
import { UsuarioRepository } from './infrastructure/persistence/repositories/usuario.repository';
import { CrearUsuarioUseCase } from './application/use-cases/usuarios/crear-usuario.use-case';
import { UsuariosController } from './infrastructure/http/controllers/usuarios.controller';
import { USUARIO_REPOSITORY } from './domain/ports/usuario.repository.token';

@Module({
    imports: [TypeOrmModule.forFeature([UsuarioOrmEntity])],
    controllers: [UsuariosController],
    providers:[
        CrearUsuarioUseCase,
        {
            provide:USUARIO_REPOSITORY,
            useClass: UsuarioRepository,
        },
    ],
    exports:[],
})
export class IamModule{}
