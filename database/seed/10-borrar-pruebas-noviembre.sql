-- ============================================================================
--  AgroSoft — Borrar los datos de prueba de noviembre
--  Proyecto formativo SENA · Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Borra SOLO lo que se creó para probar pantallas, avisos y el bot de
--    Telegram (13 de noviembre de 2026). Cada borrado exige el id Y que el
--    nombre empiece por "Prueba": en otra base, con otros ids, no borra nada.
--
--  QUE BORRA
--    Cultivos 6 y 7 (Prueba Área editada, Prueba Cultivo Panel) + historial
--    Cosecha 8 (12 bultos de Prueba Cultivo Panel) + sus movimientos
--    Incidencias 5 a 9 y sus tratamientos (4 y 5)
--    Actividades 7 y 8 (Prueba aviso vencida, Prueba fecha limite) + asignaciones
--    Insumos 6 a 10 (Prueba Insumo Modal ... Prueba Token Nuevo) + movimientos
--    Alerta de sensor 6 (valor 41.5)
--    Notificaciones que mencionan "Prueba"
--
--  QUE NO TOCA
--    Usuarios, roles, permisos, cultivos e incidencias reales, ventas,
--    conversaciones de AgroBot, vinculación de Telegram.
--
--  COMO SE CORRE
--    pgAdmin → base Agrosoft_DB → Query Tool → abrir este archivo → F5.
--    Va todo en una transacción: si una línea falla no se borra nada.
--
--  ADVERTENCIA
--    No se puede deshacer.
-- ============================================================================

BEGIN;

-- Lo que se va a borrar, filtrado por id y nombre
CREATE TEMP TABLE b_cultivos   ON COMMIT DROP AS SELECT id FROM cultivos     WHERE id IN (6, 7)          AND "nombreCultivo" ILIKE 'prueba%';
CREATE TEMP TABLE b_incid      ON COMMIT DROP AS SELECT id FROM incidencias  WHERE id IN (5, 6, 7, 8, 9) AND titulo ILIKE 'prueba%';
CREATE TEMP TABLE b_activ      ON COMMIT DROP AS SELECT id FROM actividades  WHERE id IN (7, 8)          AND nombre ILIKE 'prueba%';
CREATE TEMP TABLE b_insumos    ON COMMIT DROP AS SELECT id FROM insumos      WHERE id IN (6, 7, 8, 9, 10) AND nombre ILIKE 'prueba%';
CREATE TEMP TABLE b_cosechas   ON COMMIT DROP AS SELECT id FROM lotes_produccion WHERE id = 8 AND cultivo_id IN (SELECT id FROM b_cultivos);

-- 1. Tratamientos (apuntan a incidencias)
DELETE FROM tratamientos
 WHERE incidencia_id IN (SELECT id FROM b_incid)
    OR (id IN (4, 5) AND producto ILIKE 'prueba%');

-- 2. Incidencias
DELETE FROM incidencias WHERE id IN (SELECT id FROM b_incid);

-- 3. Hijos de las actividades de prueba
DELETE FROM actividad_asignaciones       WHERE actividad_id  IN (SELECT id FROM b_activ);
DELETE FROM actividad_historial          WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_evidencias       WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_responsables     WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_servicios        WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM usos_herramientas            WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_herramientas     WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_insumos_uso      WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividades_insumos_reserva  WHERE "actividadId" IN (SELECT id FROM b_activ);
DELETE FROM actividad_insumos            WHERE actividad_id  IN (SELECT id FROM b_activ);
UPDATE novedades             SET actividad_id = NULL WHERE actividad_id IN (SELECT id FROM b_activ);
UPDATE transaccion_financiera SET actividad_id = NULL WHERE actividad_id IN (SELECT id FROM b_activ);
UPDATE movimientos_insumos   SET actividad_id = NULL WHERE actividad_id IN (SELECT id FROM b_activ);
UPDATE reservas              SET actividad_id = NULL WHERE actividad_id IN (SELECT id FROM b_activ);

-- 4. Actividades
DELETE FROM actividades WHERE id IN (SELECT id FROM b_activ);

-- 5. Hijos de los insumos de prueba (el uso va antes que el movimiento al que apunta)
DELETE FROM actividades_insumos_uso      WHERE "insumoId" IN (SELECT id FROM b_insumos);
DELETE FROM actividades_insumos_reserva  WHERE "insumoId" IN (SELECT id FROM b_insumos);
DELETE FROM usos_herramientas            WHERE "insumoId" IN (SELECT id FROM b_insumos);
DELETE FROM actividades_herramientas     WHERE "insumoId" IN (SELECT id FROM b_insumos);
DELETE FROM actividad_insumos            WHERE insumo_id  IN (SELECT id FROM b_insumos);
DELETE FROM reservas                     WHERE insumo_id  IN (SELECT id FROM b_insumos);
DELETE FROM movimientos_insumos          WHERE insumo_id  IN (SELECT id FROM b_insumos);
UPDATE novedades              SET insumo_id = NULL WHERE insumo_id IN (SELECT id FROM b_insumos);
UPDATE transaccion_financiera SET insumo_id = NULL WHERE insumo_id IN (SELECT id FROM b_insumos);

-- 6. Insumos
DELETE FROM insumos WHERE id IN (SELECT id FROM b_insumos);

-- 7. Cosecha de prueba y sus movimientos
DELETE FROM movimientos_produccion  WHERE "loteProduccionId" IN (SELECT id FROM b_cosechas);
DELETE FROM historial_precios_lote  WHERE "loteProduccionId" IN (SELECT id FROM b_cosechas);
DELETE FROM lotes_produccion        WHERE id IN (SELECT id FROM b_cosechas);

-- 8. Cultivos de prueba
DELETE FROM cultivo_historial    WHERE cultivo_id  IN (SELECT id FROM b_cultivos);
DELETE FROM actividad_historial  WHERE "cultivoId" IN (SELECT id FROM b_cultivos);
DELETE FROM cultivos             WHERE id IN (SELECT id FROM b_cultivos);

-- 9. Alerta de sensor puesta a mano
DELETE FROM sensor_alertas WHERE id = 6 AND valor = 41.5;

-- 10. Notificaciones de la campanita que hablan de las pruebas
DELETE FROM notificaciones WHERE titulo ILIKE '%prueba%' OR mensaje ILIKE '%prueba%';

-- Comprobación: todo debe salir en 0
SELECT 'cultivos'     AS que, COUNT(*) FROM cultivos         WHERE "nombreCultivo" ILIKE 'prueba%'
UNION ALL SELECT 'incidencias',   COUNT(*) FROM incidencias      WHERE titulo   ILIKE 'prueba%'
UNION ALL SELECT 'tratamientos',  COUNT(*) FROM tratamientos     WHERE producto ILIKE 'prueba%'
UNION ALL SELECT 'actividades',   COUNT(*) FROM actividades      WHERE nombre   ILIKE 'prueba%'
UNION ALL SELECT 'insumos',       COUNT(*) FROM insumos          WHERE nombre   ILIKE 'prueba%'
UNION ALL SELECT 'cosecha 8',     COUNT(*) FROM lotes_produccion WHERE id = 8
UNION ALL SELECT 'alerta 41.5',   COUNT(*) FROM sensor_alertas   WHERE id = 6;

COMMIT;
