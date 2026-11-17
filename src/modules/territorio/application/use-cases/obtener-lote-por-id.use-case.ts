import { Injectable } from '@nestjs/common';
import { AlcanceDatos } from '../../../iam/domain/value-objects/alcance-datos.vo';
import { AccesoLotesService } from '../services/acceso-lotes.service';
import { LoteOutput, toLoteOutput } from '../dto/lote.dto';

@Injectable()
export class ObtenerLotePorIdUseCase {
constructor(private readonly accesoLotes: AccesoLotesService) {}

async ejecutar(id: number, alcance: AlcanceDatos): Promise<LoteOutput> {
    const lote = await this.accesoLotes.obtenerLoteVisible(id, alcance);
    return toLoteOutput(lote);
}
}
