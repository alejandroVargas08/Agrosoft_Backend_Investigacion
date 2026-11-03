import { Inject, Injectable } from "@nestjs/common";
import type { AlcanceDatos } from "../../../modules/iam/domain/value-objects/alcance-datos.vo";
import { LOTE_REPOSITORY_PORT } from "../../../modules/territorio/domain/ports/lote.repository.port";
import type { LoteRepositoryPort } from "../../../modules/territorio/domain/ports/lote.repository.port";

@Injectable()
    export class CatalogoLotesService{
        constructor(
            @Inject(LOTE_REPOSITORY_PORT) private readonly lotes: LoteRepositoryPort){}

            async visibles(alcance: AlcanceDatos): Promise<Map<number, string>>{
                const lista = await this.lotes.buscarVisibles(alcance.verTodo ? null: alcance.programasPermitidos);
                return new Map(
                    lista.filter((lote) => lote.id !== undefined).map((lote) => [lote.id as number, lote.nombre] as [number, string]),
                );
            }
    }
