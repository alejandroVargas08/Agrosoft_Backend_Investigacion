import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlmacenOrmEntity } from './infrastructure/persistence/orm-entities/almacen.orm-entity';
import { CategoriaOrmEntity } from './infrastructure/persistence/orm-entities/categoria.orm-entity';
import { ProveedorOrmEntity } from './infrastructure/persistence/orm-entities/proveedor.orm-entity';
import { InsumoOrmEntity } from './infrastructure/persistence/orm-entities/insumo.orm-entity';
import { MovimientoInsumoOrmEntity } from './infrastructure/persistence/orm-entities/movimiento-insumo.orm-entity';
import { ReservaOrmEntity } from './infrastructure/persistence/orm-entities/reserva.orm-entity';

import { ALMACEN_REPOSITORY_PORT } from './domain/ports/almacen.repository.port';
import { CATEGORIA_REPOSITORY_PORT } from './domain/ports/categoria.repository.port';
import { PROVEEDOR_REPOSITORY_PORT } from './domain/ports/proveedor.repository.port';
import { INSUMO_REPOSITORY_PORT } from './domain/ports/insumo.repository.port';
import { MOVIMIENTO_INSUMO_REPOSITORY_PORT } from './domain/ports/movimiento-insumo.repository.port';
import { RESERVA_REPOSITORY_PORT } from './domain/ports/reserva.repository.port';

import { AlmacenTypeOrmRepository } from './infrastructure/persistence/repositories/almacen.typeorm-repository';
import { CategoriaTypeOrmRepository } from './infrastructure/persistence/repositories/categoria.typeorm-repository';
import { ProveedorTypeOrmRepository } from './infrastructure/persistence/repositories/proveedor.typeorm-repository';
import { InsumoTypeOrmRepository } from './infrastructure/persistence/repositories/insumo.typeorm-repository';
import { MovimientoInsumoTypeOrmRepository } from './infrastructure/persistence/repositories/movimiento-insumo.typeorm-repository';
import { ReservaTypeOrmRepository } from './infrastructure/persistence/repositories/reserva.typeorm-repository';

import { AlmacenController } from './infrastructure/http/almacen.controller';
import { CategoriaController } from './infrastructure/http/categoria.controller';
import { ProveedorController } from './infrastructure/http/proveedor.controller';
import { InsumoController } from './infrastructure/http/insumo.controller';
import { MovimientoInsumoController } from './infrastructure/http/movimiento-insumo.controller';
import { ReservaController } from './infrastructure/http/reserva.controller';

import { CrearAlmacenUseCase } from './application/use-cases/almacen/crear-almacen.use-case';
import { ListarAlmacenesUseCase } from './application/use-cases/almacen/listar-almacenes.use-case';
import { CrearCategoriaUseCase } from './application/use-cases/categoria/crear-categoria.use-case';
import { ListarCategoriasUseCase } from './application/use-cases/categoria/listar-categorias.use-case';
import { CrearProveedorUseCase } from './application/use-cases/proveedor/crear-proveedor.use-case';
import { ListarProveedoresUseCase } from './application/use-cases/proveedor/listar-proveedores.use-case';
import { CrearInsumoUseCase } from './application/use-cases/insumo/crear-insumo.use-case';
import { ListarInsumosUseCase } from './application/use-cases/insumo/listar-insumos.use-case';
import { ListarInsumosBajoStockMinimoUseCase } from './application/use-cases/insumo/listar-insumos-bajo-stock-minimo.use-case';
import { RegistrarMovimientoInsumoUseCase } from './application/use-cases/movimiento/registrar-movimiento-insumo.use-case';
import { CrearReservaUseCase } from './application/use-cases/reserva/crear-reserva.use-case';
import { CancelarReservaUseCase } from './application/use-cases/reserva/cancelar-reserva.use-case';
import { ConfirmarReservaUseCase } from './application/use-cases/reserva/confirmar-reserva.use-case';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        AlmacenOrmEntity,
        CategoriaOrmEntity,
        ProveedorOrmEntity,
        InsumoOrmEntity,
        MovimientoInsumoOrmEntity,
        ReservaOrmEntity,
        ]),
    ],
    controllers: [
        AlmacenController,
        CategoriaController,
        ProveedorController,
        InsumoController,
        MovimientoInsumoController,
        ReservaController,
    ],
    providers: [
        // Casos de uso
        CrearAlmacenUseCase,
        ListarAlmacenesUseCase,
        CrearCategoriaUseCase,
        ListarCategoriasUseCase,
        CrearProveedorUseCase,
        ListarProveedoresUseCase,
        CrearInsumoUseCase,
        ListarInsumosUseCase,
        ListarInsumosBajoStockMinimoUseCase,
        RegistrarMovimientoInsumoUseCase,
        CrearReservaUseCase,
        CancelarReservaUseCase,
        ConfirmarReservaUseCase,

        // Conexión puerto -> implementación (el único lugar donde se "atan los cables")
        { provide: ALMACEN_REPOSITORY_PORT, useClass: AlmacenTypeOrmRepository },
        { provide: CATEGORIA_REPOSITORY_PORT, useClass: CategoriaTypeOrmRepository },
        { provide: PROVEEDOR_REPOSITORY_PORT, useClass: ProveedorTypeOrmRepository },
        { provide: INSUMO_REPOSITORY_PORT, useClass: InsumoTypeOrmRepository },
        { provide: MOVIMIENTO_INSUMO_REPOSITORY_PORT, useClass: MovimientoInsumoTypeOrmRepository },
        { provide: RESERVA_REPOSITORY_PORT, useClass: ReservaTypeOrmRepository },
    ],
    exports: [],
    })
export class InventarioModule {}