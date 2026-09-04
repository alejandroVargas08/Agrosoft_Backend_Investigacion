import { AlmacenOrmEntity } from '../orm-entities/almacen.orm-entity';
import { Almacen } from '../../../domain/entities/almacen.entity';

export class AlmacenMapper {
    static aDominio(orm: AlmacenOrmEntity): Almacen {
        return Almacen.reconstruir({
        id: orm.id,
        nombre: orm.nombre,
        descripcion: orm.descripcion,
        ubicacion: orm.ubicacion,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
        deletedAt: orm.deletedAt,
        });
    }

    static aOrm(almacen: Almacen): Partial<AlmacenOrmEntity> {
        return {
        id: almacen.id,
        nombre: almacen.nombre,
        descripcion: almacen.descripcion,
        ubicacion: almacen.ubicacion,
        deletedAt: almacen.deletedAt ?? null,
        };
    }
}