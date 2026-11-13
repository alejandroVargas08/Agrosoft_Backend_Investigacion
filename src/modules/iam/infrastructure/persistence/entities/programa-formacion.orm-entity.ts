import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { fechaSinHora } from '../../../../../shared/persistence/fecha-sin-hora.transformer';

@Entity('programas_formacion')
export class ProgramaFormacionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 20 })
  ficha: string;

  @Column({ type: 'date', name: 'fecha_inicio', transformer: fechaSinHora })
  fechaInicio: Date;

  @Column({ type: 'date', name: 'fecha_fin', transformer: fechaSinHora })
  fechaFin: Date;

  @Column({ type: 'varchar', length: 30 })
  estado: string;
}