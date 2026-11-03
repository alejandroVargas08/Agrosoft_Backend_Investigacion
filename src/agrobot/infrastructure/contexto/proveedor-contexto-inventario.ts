import { Injectable } from "@nestjs/common";
import { ListarInsumosBajoStockMinimoUseCase } from "../../../modules/inventario/application/use-cases/insumo/listar-insumos-bajo-stock-minimo.use-case";
import type { ProveedorContextoPort } from "../../domain/ports/proveedor-contexto.port";

@Injectable()
    export class ProveedorContextoInventario implements ProveedorContextoPort{
        readonly fuente= 'inventario' as const;

        constructor(
            private readonly insumosBajoStock: ListarInsumosBajoStockMinimoUseCase
        ){}

        async obtener(): Promise<string>{
            const insumo = await this.insumosBajoStock.ejecutar();
            if (insumo.length === 0)
                return 'INVENTARIO: Ningun insumo esta por debajo de stock mínimo.';

            const lineas =insumo.map(
                (i)=>
                    `${i.nombre} | disponible ${i.stockDisponible} ${i.unidadUso} | mínimo ${i.stockMinimo} ${i.unidadUso} | reservado ${i.stockReservado} ${i.unidadUso}`
            );
            return ['INVENTARIO (insumos por debajo del stock mínimo):', ...lineas].join('\n');
        }
    }
    