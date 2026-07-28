import { UUID } from "typeorm/driver/mongodb/bson.typings.js";
import { Usuario } from "../../../domain/entities/usuario.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { Password } from "../../../domain/value-objects/password.vo";
import { UsuarioOrmEntity } from "../entities/usuario.orm-entity";

export class UsuarioMapper{
    static aDominio(ormEntity: UsuarioOrmEntity): Usuario{
        return Usuario.reconstruir(
            ormEntity.id,
            ormEntity.nombre,
            Email.create(ormEntity.email),
            Password.fromHash(ormEntity.password),
            ormEntity.activo,
        );
    };
    
    static aPersistencia(usuario: Usuario): UsuarioOrmEntity{
        const ormEntity = new UsuarioOrmEntity();
        ormEntity.id = usuario.getId();
        ormEntity.nombre= usuario.getNombre();
        ormEntity.email = usuario.getEmail().getValue();
        ormEntity.password= usuario.getPassword().getHash();
        ormEntity.activo= usuario.getActivo();

        return ormEntity;
    }
}