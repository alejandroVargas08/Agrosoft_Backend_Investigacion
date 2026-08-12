import { ProveedorOrmEntity } from '../orm-entities/proveedor.orm-entity';
import { Proveedor } from '../../../domain/entities/proveedor.entity';

export class ProveedorMapper {
    static aDominio(orm: ProveedorOrmEntity): Proveedor {
        return Proveedor.reconstruir({
        id: orm.id,
        nombre: orm.nombre,
        deletedAt: orm.deletedAt,
        });
    }

    static aOrm(proveedor: Proveedor): Partial<ProveedorOrmEntity> {
        return {
        id: proveedor.id,
        nombre: proveedor.nombre,
        deletedAt: proveedor.deletedAt ?? null,
        };
    }
}