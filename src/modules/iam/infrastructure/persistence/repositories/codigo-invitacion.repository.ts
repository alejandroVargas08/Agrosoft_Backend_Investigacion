import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import type { CodigoInvitacionRepositoryPort } from '../../../domain/ports/codigo-invitacion.repository.port';
import { CodigoInvitacion } from '../../../domain/entities/codigo-invitacion.entity';
import { CodigoInvitacionOrmEntity } from '../entities/codigo-invitacion.orm-entity';

@Injectable()
export class CodigoInvitacionRepository implements CodigoInvitacionRepositoryPort {
    constructor(
        @InjectRepository(CodigoInvitacionOrmEntity)
        private readonly repo: Repository<CodigoInvitacionOrmEntity>,
    ) {}

    private aDominio(fila: CodigoInvitacionOrmEntity): CodigoInvitacion {
        return new CodigoInvitacion(
            fila.codigo,
            fila.programaFormacionId,
            fila.expiraEn,
            fila.creadoPorId,
            fila.anuladoEn,
            fila.id,
        );
    }

    async guardar(codigo: CodigoInvitacion): Promise<CodigoInvitacion> {
        const fila = await this.repo.save({
            codigo: codigo.codigo,
            programaFormacionId: codigo.programaFormacionId,
            expiraEn: codigo.expiraEn,
            creadoPorId: codigo.creadoPorId,
            anuladoEn: codigo.anuladoEn,
        });
        return this.aDominio(fila);
    }

    async buscarPorCodigo(codigo: string): Promise<CodigoInvitacion | null> {
        const fila = await this.repo.findOne({ where: { codigo } });
        return fila ? this.aDominio(fila) : null;
    }

    async buscarVigenteDe(programaFormacionId: number): Promise<CodigoInvitacion | null> {
        const fila = await this.repo.findOne({
            where: { programaFormacionId, anuladoEn: IsNull(), expiraEn: MoreThan(new Date()) },
            order: { id: 'DESC' },
        });
        return fila ? this.aDominio(fila) : null;
    }

    async anularDe(programaFormacionId: number): Promise<void> {
        await this.repo.update({ programaFormacionId, anuladoEn: IsNull() }, { anuladoEn: new Date() });
    }
}
