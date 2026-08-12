import { CategoriaOrmEntity } from '../orm-entities/categoria.orm-entity';
import { Categoria } from '../../../domain/entities/categoria.entity';

export class CategoriaMapper {
    static aDominio(orm: CategoriaOrmEntity): Categoria {
        return Categoria.reconstruir({
        id: orm.id,
        nombre: orm.nombre,
        descripcion: orm.descripcion,
        tipoInsumo: orm.tipoInsumo,
        deletedAt: orm.deletedAt,
        });
    }

    static aOrm(categoria: Categoria): Partial<CategoriaOrmEntity> {
        return {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        tipoInsumo: categoria.tipoInsumo,
        deletedAt: categoria.deletedAt ?? null,
        };
    }
}