import { Inject, Injectable } from '@nestjs/common';
import type { UsuarioAutenticado } from '../../../modules/iam/domain/value-objects/alcance-datos.vo';
import type { SensorRepositoryPort } from '../../../modules/iot/domain/ports/sensor.repository.port';
import { SENSOR_REPOSITORY_TOKEN } from '../../../modules/iot/domain/ports/sensor.repository.token';
import type { TipoSensorRepositoryPort } from '../../../modules/iot/domain/ports/tipo-sensor.repository.port';
import { TIPO_SENSOR_REPOSITORY_TOKEN } from '../../../modules/iot/domain/ports/tipo-sensor.repository.token';
import type { SensorLecturaRepositoryPort } from '../../../modules/iot/domain/ports/sensor-lectura.repository.port';
import { SENSOR_LECTURA_REPOSITORY_TOKEN } from '../../../modules/iot/domain/ports/sensor-lectura.repository.token';
import type { SensorAlertaRepositoryPort } from '../../../modules/iot/domain/ports/sensor-alerta.repository.port';
import { SENSOR_ALERTA_REPOSITORY_TOKEN } from '../../../modules/iot/domain/ports/sensor-alerta.repository.token';
import type { ProveedorContextoPort } from '../../domain/ports/proveedor-contexto.port';
import { CatalogoLotesService } from '../../application/services/catalogo-lotes.service';
import { formatoFecha, promedio } from './formato';

const VENTANA_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ProveedorContextoSensores implements ProveedorContextoPort {
  readonly fuente = 'sensores' as const;

  constructor(
    @Inject(SENSOR_REPOSITORY_TOKEN) private readonly sensores: SensorRepositoryPort,
    @Inject(TIPO_SENSOR_REPOSITORY_TOKEN) private readonly tipos: TipoSensorRepositoryPort,
    @Inject(SENSOR_LECTURA_REPOSITORY_TOKEN) private readonly lecturas: SensorLecturaRepositoryPort,
    @Inject(SENSOR_ALERTA_REPOSITORY_TOKEN) private readonly alertas: SensorAlertaRepositoryPort,
    private readonly catalogoLotes: CatalogoLotesService,
  ) {}

  async obtener(usuario: UsuarioAutenticado): Promise<string> {
    const [lotes, sensores, tipos] = await Promise.all([
      this.catalogoLotes.visibles(usuario),
      this.sensores.listarTodos(),
      this.tipos.listarTodos(),
    ]);

    const visibles = sensores.filter((s) => s.activo && (s.loteId === null ? usuario.verTodo : lotes.has(s.loteId)));
    if (visibles.length === 0) return 'SENSORES: no hay estaciones activas en los lotes de este usuario.';

    const tipoPorId = new Map(tipos.map((t) => [t.id, t]));
    const desde = new Date(Date.now() - VENTANA_MS);

    const lineas = await Promise.all(
      visibles.map(async (sensor) => {
        const id = sensor.id as number;
        const tipo = tipoPorId.get(sensor.tipoSensorId);
        const unidad = tipo?.unidad ?? '';
        const [lecturas, alertas] = await Promise.all([
          this.lecturas.listarDesde(id, desde),
          this.alertas.listarPorSensorId(id),
        ]);

        const valores = lecturas.map((l) => Number(l.valor)).filter((v) => Number.isFinite(v));
        const resumen = valores.length
          ? `promedio ${promedio(valores)} ${unidad}, mínimo ${Math.min(...valores)}, máximo ${Math.max(...valores)} (${valores.length} lecturas)`
          : 'sin lecturas';

        const alertas24 = alertas.filter((a) => a.fechaAlerta.getTime() >= desde.getTime());
        const detalleAlertas = alertas24.length
          ? alertas24
              .slice(-5)
              .map((a) => `${a.tipo === 'MAXIMO' ? 'sobre el máximo' : 'bajo el mínimo'} (${a.umbral}) con valor ${a.valor} el ${formatoFecha(a.fechaAlerta)}`)
              .join('; ')
          : 'ninguna';

        const minutos = sensor.ultimaMedicion ? Math.round((Date.now() - sensor.ultimaMedicion.getTime()) / 60000) : null;
        const lote = sensor.loteId === null ? 'sin lote' : (lotes.get(sensor.loteId) ?? `lote ${sensor.loteId}`);

        return (
          `- ${sensor.nombreSensor} | ${tipo?.nombre ?? 'sensor'} | ${lote}` +
          ` | valor actual ${sensor.ultimoValor ?? 'sin dato'} ${unidad}` +
          ` | última lectura ${formatoFecha(sensor.ultimaMedicion)}${minutos !== null ? ` (hace ${minutos} min)` : ''}` +
          ` | conexión ${sensor.estadoConexion}` +
          ` | rango normal ${sensor.rango.minimo} a ${sensor.rango.maximo}` +
          ` | últimas 24 h: ${resumen}` +
          ` | alertas 24 h: ${detalleAlertas}`
        );
      }),
    );

    return ['SENSORES (lecturas de las últimas 24 h):', ...lineas].join('\n');
  }
}
