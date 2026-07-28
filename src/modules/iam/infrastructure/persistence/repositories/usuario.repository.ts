import { Injectable } from "@nestjs/common";
import { UsuarioRepositoryPort } from "../../../domain/ports/usuario.repository.port";
import { UsuarioOrmEntity } from "../entities/usuario.orm-entity";
import { Repository } from "typeorm";
import { Usuario } from "../../../domain/entities/usuario.entity";
import { UsuarioMapper } from "../mappers/usuario.mapper";
import { InjectRepository } from "@nestjs/typeorm";



@Injectable()
export class UsuarioRepository implements UsuarioRepositoryPort {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repository: Repository<UsuarioOrmEntity>,
  ) {}


    async guardar(usuario: Usuario): Promise<void> {
        const ormEntity = UsuarioMapper.aPersistencia(usuario);
        await this.repository.save(ormEntity);
    }

    async buscarPorId(id: string): Promise<Usuario | null> {
        const ormEntity = await this.repository.findOne({where: {id}});

        if(!ormEntity){
            return null;
        }
        return UsuarioMapper.aDominio(ormEntity);
    }

    async buscarPorEmail(email: string): Promise<Usuario | null> {
        const ormEntity = await this.repository.findOne({where: {email}});

        if(!ormEntity){
            return null;
        }
        return UsuarioMapper.aDominio(ormEntity);
    }

    async listar(): Promise<Usuario[]> {
        const ormEntities = await this.repository.find();
        return ormEntities.map((ormEntity) => UsuarioMapper.aDominio(ormEntity));
    }
    
    async eliminarId(id: string): Promise<void>{
        await this.repository.delete(id);
    }
}