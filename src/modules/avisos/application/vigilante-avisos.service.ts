import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { AvisoRegistroOrmEntity } from '../infrastructure/persistence/aviso-registro.orm-entity';
import { AvisosService } from './avisos.service';

const CADA_MS = 60_000;
const PRIMERA_VEZ_MS = 15_000;

// Usuarios activos que tienen el permiso $1, por su rol o asignado a mano
const CON_PERMISO = `
    u.eliminado_en IS NULL AND u.estado = 'activo' AND EXISTS (
        SELECT 1 FROM permisos p
        WHERE p.nombre = $1 AND p.eliminado_en IS NULL AND (
            EXISTS (SELECT 1 FROM rol_permisos rp
                    WHERE rp.rol_id = u.rol_id AND rp.permiso_id = p.id AND rp.eliminado_en IS NULL)
         OR EXISTS (SELECT 1 FROM permisos_de_usuarios up
                    WHERE up.usuario_id = u.id AND up.permiso_id = p.id AND up.eliminado_en IS NULL)))`;

// ...y que alcanzan a ver la ficha $2: la suya, una a cargo, o todas. Una ficha
// NULL la ve cualquiera, igual que en el resto del sistema.
const VE_FICHA = `
    ($2::int IS NULL
     OR u.programa_formacion_id = $2
     OR EXISTS (SELECT 1 FROM usuario_programas_formacion upf
                WHERE upf.usuario_id = u.id AND upf.programa_formacion_id = $2)
     OR EXISTS (SELECT 1 FROM permisos p2
                WHERE p2.nombre = 'fichas.ver_todas' AND p2.eliminado_en IS NULL AND (
                    EXISTS (SELECT 1 FROM rol_permisos rp2
                            WHERE rp2.rol_id = u.rol_id AND rp2.permiso_id = p2.id AND rp2.eliminado_en IS NULL)
                 OR EXISTS (SELECT 1 FROM permisos_de_usuarios up2
                            WHERE up2.usuario_id = u.id AND up2.permiso_id = p2.id AND up2.eliminado_en IS NULL))))`;

// En la base van en inglés (low/medium/high)
const SEVERIDAD: Record<string, string> = { low: 'baja', medium: 'media', high: 'alta' };

const fmtNum = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toLocaleString('es-CO', { maximumFractionDigits: 2 }) : String(v);
};

/**
 * Revisa cada minuto si pasó algo que haya que avisar. Va por consulta y no
 * metido en cada caso de uso: así cubre todos los caminos (la app, el bot, un
 * script) sin tocar los módulos de sensores, inventario o actividades.
 *
 * La primera vez solo toma nota de lo que ya existía, para no mandarle a nadie
 * cien avisos viejos de golpe.
 */
@Injectable()
export class VigilanteAvisosService implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(VigilanteAvisosService.name);
    private temporizador?: NodeJS.Timeout;
    private inicio?: NodeJS.Timeout;
    private revisando = false;

    constructor(
        @InjectDataSource() private readonly db: DataSource,
        @InjectRepository(AvisoRegistroOrmEntity) private readonly registro: Repository<AvisoRegistroOrmEntity>,
        private readonly avisos: AvisosService,
    ) {}

    onApplicationBootstrap() {
        if (process.env.AVISOS_ENABLED === 'false') return;
        this.inicio = setTimeout(() => void this.revisar(), PRIMERA_VEZ_MS);
        this.temporizador = setInterval(() => void this.revisar(), CADA_MS);
    }

    onModuleDestroy() {
        clearTimeout(this.inicio);
        clearInterval(this.temporizador);
    }

    async revisar(): Promise<void> {
        if (this.revisando) return;
        this.revisando = true;
        try {
            const soloAnotar = !(await this.registro.findOneBy({ clave: 'inicializado' }));
            for (const [nombre, paso] of [
                ['alertas de sensores', () => this.alertasSensores(soloAnotar)],
                ['incidencias', () => this.incidencias(soloAnotar)],
                ['stock bajo', () => this.stockBajo(soloAnotar)],
                ['actividades vencidas', () => this.actividadesVencidas(soloAnotar)],
            ] as const) {
                try {
                    await paso();
                } catch (error) {
                    this.logger.warn(`Avisos de ${nombre}: ${(error as Error).message}`);
                }
            }
            if (soloAnotar) {
                await this.registro.save({ clave: 'inicializado', valor: new Date().toISOString().slice(0, 19) });
                this.logger.log('Avisos listos: lo que ya existía quedó anotado sin avisar.');
            }
        } finally {
            this.revisando = false;
        }
    }

    // ── Utilidades ──────────────────────────────────────────────────────────

    private async destinatarios(permiso: string, programaId: number | null): Promise<number[]> {
        const filas = await this.db.query(
            `SELECT u.id FROM usuarios u WHERE ${CON_PERMISO} AND ${VE_FICHA}`,
            [permiso, programaId],
        );
        return filas.map((f: { id: number }) => Number(f.id));
    }

    private async marca(clave: string): Promise<number | null> {
        const fila = await this.registro.findOneBy({ clave });
        return fila?.valor ? Number(fila.valor) : null;
    }

    private async ponerMarca(clave: string, valor: number) {
        await this.registro.save({ clave, valor: String(valor) });
    }

    private async anotadas(prefijo: string): Promise<Set<string>> {
        const filas = await this.registro.findBy({ clave: Like(prefijo + '%') });
        return new Set(filas.map((f) => f.clave));
    }

    // ── Los cuatro avisos ───────────────────────────────────────────────────

    /** Cada alerta nueva de sensor, a quien gestiona sensores y ve ese lote. */
    private async alertasSensores(soloAnotar: boolean) {
        const clave = 'marca:sensor_alertas';
        const desde = await this.marca(clave);
        if (desde === null || soloAnotar) {
            const [{ max }] = await this.db.query(`SELECT COALESCE(MAX(id), 0) AS max FROM sensor_alertas`);
            await this.ponerMarca(clave, Number(max));
            return;
        }
        const nuevas = await this.db.query(
            `SELECT a.id, a.valor, a.umbral, s.nombre_sensor AS sensor, l.nombre AS lote,
                    l.programa_formacion_id AS programa
             FROM sensor_alertas a
             JOIN sensores s ON s.id = a.sensor_id
             LEFT JOIN lotes l ON l.id = COALESCE(a.lote_id, s.lote_id)
             WHERE a.id > $1 AND a.eliminado_en IS NULL
             ORDER BY a.id LIMIT 50`,
            [desde],
        );
        for (const a of nuevas) {
            const para = await this.destinatarios('sensores.gestionar', a.programa ?? null);
            await this.avisos.emitir(para, {
                tipo: 'alerta_sensor',
                titulo: 'Alerta de sensor',
                mensaje: `${a.sensor}${a.lote ? ' en ' + a.lote : ''}: marcó ${fmtNum(a.valor)}, fuera del rango (umbral ${fmtNum(a.umbral)}).`,
            }, { sensorAlertaId: a.id });
            await this.ponerMarca(clave, Number(a.id));
        }
    }

    /** Cada incidencia nueva, a quien gestiona cultivos y ve ese lote, menos a quien la reportó. */
    private async incidencias(soloAnotar: boolean) {
        const clave = 'marca:incidencias';
        const desde = await this.marca(clave);
        if (desde === null || soloAnotar) {
            const [{ max }] = await this.db.query(`SELECT COALESCE(MAX(id), 0) AS max FROM incidencias`);
            await this.ponerMarca(clave, Number(max));
            return;
        }
        const nuevas = await this.db.query(
            `SELECT i.id, i.titulo, i.severidad, i.creado_por_usuario_id AS autor,
                    c."nombreCultivo" AS cultivo, l.programa_formacion_id AS programa
             FROM incidencias i
             LEFT JOIN cultivos c ON c.id = i.cultivo_id
             LEFT JOIN lotes l ON l.id = c.lote_id
             WHERE i.id > $1 AND i.deleted_at IS NULL
             ORDER BY i.id LIMIT 50`,
            [desde],
        );
        for (const i of nuevas) {
            const para = (await this.destinatarios('cultivos.gestionar', i.programa ?? null))
                .filter((id) => id !== Number(i.autor));
            await this.avisos.emitir(para, {
                tipo: 'incidencia',
                titulo: 'Nueva incidencia',
                mensaje: `${i.titulo}${i.cultivo ? ' en ' + i.cultivo : ''}${i.severidad ? ' · severidad ' + (SEVERIDAD[String(i.severidad).toLowerCase()] ?? String(i.severidad).toLowerCase()) : ''}.`,
            }, { incidenciaId: i.id });
            await this.ponerMarca(clave, Number(i.id));
        }
    }

    /** Un insumo que baja del mínimo avisa una vez; si se repone y vuelve a bajar, avisa otra vez. */
    private async stockBajo(soloAnotar: boolean) {
        const bajos = await this.db.query(
            `SELECT id, nombre, stock_uso AS stock, stock_minimo AS minimo, unidad_uso AS unidad
             FROM insumos WHERE deleted_at IS NULL AND stock_uso <= stock_minimo`,
        );
        const ya = await this.anotadas('stock:');
        const bajosIds = new Set(bajos.map((b: { id: number }) => 'stock:' + b.id));

        // Los que se repusieron se olvidan, para avisar si vuelven a bajar
        const repuestos = [...ya].filter((c) => !bajosIds.has(c));
        if (repuestos.length > 0) await this.registro.delete({ clave: In(repuestos) });

        const nuevos = bajos.filter((b: { id: number }) => !ya.has('stock:' + b.id));
        if (nuevos.length === 0) return;
        const para = soloAnotar ? [] : await this.destinatarios('inventario.gestionar', null);
        for (const b of nuevos) {
            if (!soloAnotar) {
                await this.avisos.emitir(para, {
                    tipo: 'stock_bajo',
                    titulo: 'Stock bajo',
                    mensaje: `${b.nombre}: quedan ${fmtNum(b.stock)} ${b.unidad}, el mínimo es ${fmtNum(b.minimo)}.`,
                }, { insumoId: b.id });
            }
            await this.registro.save({ clave: 'stock:' + b.id, valor: String(b.stock) });
        }
    }

    /** Una tarea que se pasó de la fecha límite sin entregar: al aprendiz y a sus instructores. */
    private async actividadesVencidas(soloAnotar: boolean) {
        const vencidas = await this.db.query(
            `SELECT aa.id, aa.aprendiz_id AS aprendiz, aa.fecha_limite AS limite, act.nombre AS actividad,
                    TRIM(CONCAT(u.nombre, ' ', COALESCE(u.apellido, ''))) AS nombre,
                    u.programa_formacion_id AS programa
             FROM actividad_asignaciones aa
             JOIN actividades act ON act.id = aa.actividad_id AND act.deleted_at IS NULL
             JOIN usuarios u ON u.id = aa.aprendiz_id
             WHERE aa.eliminado_en IS NULL
               AND aa.estado IN ('ASIGNADA', 'EN_PROGRESO', 'DEVUELTA')
               AND aa.fecha_limite IS NOT NULL
               AND aa.fecha_limite < (now() AT TIME ZONE 'America/Bogota')::date`,
        );
        const ya = await this.anotadas('vencida:');
        for (const v of vencidas) {
            const clave = 'vencida:' + v.id;
            if (ya.has(clave)) continue;
            if (!soloAnotar) {
                const fecha = new Date(v.limite).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' });
                await this.avisos.emitir([Number(v.aprendiz)], {
                    tipo: 'actividad_vencida',
                    titulo: 'Tarea vencida',
                    mensaje: `"${v.actividad}" venció el ${fecha} y todavía no la entregas.`,
                }, { asignacionId: v.id });
                const instructores = (await this.destinatarios('actividades.asignar', v.programa ?? null))
                    .filter((id) => id !== Number(v.aprendiz));
                await this.avisos.emitir(instructores, {
                    tipo: 'actividad_vencida',
                    titulo: 'Tarea vencida',
                    mensaje: `${v.nombre} no entregó "${v.actividad}", que vencía el ${fecha}.`,
                }, { asignacionId: v.id });
            }
            await this.registro.save({ clave, valor: null });
        }
    }
}
