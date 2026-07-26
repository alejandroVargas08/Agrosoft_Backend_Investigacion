import { Inject, Injectable } from "@nestjs/common";
import { Cultivo } from "../../domain/entities/cultivo.entity";
import { Cultivo_Repository, CultivoRepositoryPort } from "../../domain/ports/cultivo.repository.port";
import { CrearCultivoDto } from "../dtos/crear-cultivo.dto";

@Injectable()
export class CrearCultivoUseCase {
    constructor( @Inject(Cultivo_Repository) private readonly cultivoRepo: CultivoRepositoryPort, ) {}

    async ejecutar(dto: CrearCultivoDto) : Promise<Cultivo> {
        const cultivo = new Cultivo(
            null,
            dto.nombreCultivo,
            dto.tipoCultivo,
            dto.loteId,
            dto.subLoteId ?? null,
            new Date(dto.fechaSiembra),
            null,
            0,
            'activo',
        );
        return this.cultivoRepo.crear(cultivo)
    } 
}