import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { registrarUsoHerramientaDto } from "../dto/registrar-uso-herramienta.dto";
import { usoHerramienta } from "../../domain/entities/uso-herramienta.entity";
import { uso_HerramientaRepository } from "../../domain/ports/uso-herramienta.repository.port";
import { type usoHerramientaRepositoryPort } from "../../domain/ports/uso-herramienta.repository.port";

@Injectable()
    export class registrarUsoHerramientaUseCase {
        constructor(
            @Inject(uso_HerramientaRepository)
            private readonly repo: usoHerramientaRepositoryPort,
        ) {}

        async ejecutar(actividadId: number, dto: registrarUsoHerramientaDto): Promise<usoHerramienta> {
            let valorLibrosAntes = dto.valorLibrosAntes;

            if(valorLibrosAntes === undefined) {
                const ultimoValor = await this.repo.obtenerUltimoValorLibros(dto.insumoId);
                if (ultimoValor === null) {
                    throw new BadRequestException(
                        'No hay historial previo de esta herramienta: debes indicar valorEnLibrosAntes manualmente la primera vez',
                    );
                }
                valorLibrosAntes = ultimoValor;
            }

            const uso = usoHerramienta.crear({
                actividadId,
                insumoId: dto.insumoId,
                horasUsadas: dto.horasUsadas,
                valorLibrosAntes,
                tasaDepreciacionHora: dto.tasaDepreciacionHora,
                fechaUso: new Date(),
            });

            return this.repo.crear(uso);
        }
    }