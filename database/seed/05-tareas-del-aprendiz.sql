-- ============================================================================
--  05 — Tareas y notificaciones del aprendiz
-- ----------------------------------------------------------------------------
--  El Inicio del aprendiz sale vacio si nadie le asigno nada. Esto le siembra
--  tres tareas en estados distintos y unas notificaciones, para que la pantalla
--  se vea como el diseno y se pueda mostrar en la sustentacion.
--
--  Numeros que deben quedar en los contadores:
--      Tareas pendientes ....... 2   (EN_PROGRESO + DEVUELTA)
--      Por vencer esta semana .. 3   (las tres con fecha limite dentro de 7 dias)
--      Devueltas ............... 1
--      Horas acumuladas ........ 10h (6 de la devuelta + 4 de la entregada)
--
--  Se puede correr varias veces: no duplica.
--  Requiere que 02-datos-sustentacion.sql ya haya cargado actividades.
-- ============================================================================

DO $tareas$
DECLARE
    -- Cambia estos dos correos si usas otras cuentas
    v_correo_aprendiz   text := 'Juan13@gmail.com';
    v_correo_instructor text := 'carlos12@gmail.com';

    v_aprendiz_id   int;
    v_instructor_id int;

    v_act_1 int;  -- en progreso
    v_act_2 int;  -- devuelta
    v_act_3 int;  -- entregada

    v_creadas int := 0;
BEGIN
    SELECT id INTO v_aprendiz_id
      FROM usuarios WHERE LOWER(correo) = LOWER(v_correo_aprendiz) AND eliminado_en IS NULL;

    SELECT id INTO v_instructor_id
      FROM usuarios WHERE LOWER(correo) = LOWER(v_correo_instructor) AND eliminado_en IS NULL;

    IF v_aprendiz_id IS NULL THEN
        RAISE EXCEPTION 'No existe el aprendiz %. Revisa el correo en las variables.', v_correo_aprendiz;
    END IF;

    -- Si no hay instructor, el propio aprendiz queda como asignador: el dato es
    -- obligatorio y lo que importa aqui es que la pantalla tenga contenido
    IF v_instructor_id IS NULL THEN
        v_instructor_id := v_aprendiz_id;
        RAISE NOTICE 'No encontre al instructor %, uso al aprendiz como asignador.', v_correo_instructor;
    END IF;

    -- Tres actividades cualesquiera, las mas recientes
    SELECT id INTO v_act_1 FROM actividades WHERE deleted_at IS NULL ORDER BY id DESC OFFSET 0 LIMIT 1;
    SELECT id INTO v_act_2 FROM actividades WHERE deleted_at IS NULL ORDER BY id DESC OFFSET 1 LIMIT 1;
    SELECT id INTO v_act_3 FROM actividades WHERE deleted_at IS NULL ORDER BY id DESC OFFSET 2 LIMIT 1;

    -- Ojo: `actividades` usa deleted_at, no eliminado_en como el resto
    IF v_act_1 IS NULL OR v_act_2 IS NULL OR v_act_3 IS NULL THEN
        RAISE EXCEPTION 'Hacen falta al menos 3 actividades. Corre antes 02-datos-sustentacion.sql.';
    END IF;

    -- ── 1. En progreso: es la que sale en "Tu proxima tarea" ────────────────
    IF NOT EXISTS (SELECT 1 FROM actividad_asignaciones
                    WHERE actividad_id = v_act_1 AND aprendiz_id = v_aprendiz_id AND eliminado_en IS NULL) THEN
        INSERT INTO actividad_asignaciones
            (actividad_id, aprendiz_id, asignado_por_id, estado, fecha_limite, horas_trabajadas, iniciada_en)
        VALUES
            (v_act_1, v_aprendiz_id, v_instructor_id, 'EN_PROGRESO',
             CURRENT_DATE + 3, NULL, NOW() - INTERVAL '2 days');
        v_creadas := v_creadas + 1;
    END IF;

    -- ── 2. Devuelta: cuenta como pendiente y como devuelta ──────────────────
    IF NOT EXISTS (SELECT 1 FROM actividad_asignaciones
                    WHERE actividad_id = v_act_2 AND aprendiz_id = v_aprendiz_id AND eliminado_en IS NULL) THEN
        INSERT INTO actividad_asignaciones
            (actividad_id, aprendiz_id, asignado_por_id, estado, fecha_limite, horas_trabajadas,
             comentario_aprendiz, comentario_instructor, iniciada_en, entregada_en, revisada_en, revisada_por_id)
        VALUES
            (v_act_2, v_aprendiz_id, v_instructor_id, 'DEVUELTA',
             CURRENT_DATE + 5, 6,
             'Terminé la jornada de la mañana.',
             'Faltan las fotos del lote después de la aplicación. Vuelve a entregarla con la evidencia.',
             NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', v_instructor_id);
        v_creadas := v_creadas + 1;
    END IF;

    -- ── 3. Entregada: suma horas y cuenta en "por vencer" ───────────────────
    IF NOT EXISTS (SELECT 1 FROM actividad_asignaciones
                    WHERE actividad_id = v_act_3 AND aprendiz_id = v_aprendiz_id AND eliminado_en IS NULL) THEN
        INSERT INTO actividad_asignaciones
            (actividad_id, aprendiz_id, asignado_por_id, estado, fecha_limite, horas_trabajadas,
             comentario_aprendiz, iniciada_en, entregada_en)
        VALUES
            (v_act_3, v_aprendiz_id, v_instructor_id, 'ENTREGADA',
             CURRENT_DATE + 6, 4,
             'Entregada con las evidencias en la carpeta compartida.',
             NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day');
        v_creadas := v_creadas + 1;
    END IF;

    -- ── Notificaciones ──────────────────────────────────────────────────────
    -- El sistema solo emite los tipos 'tarea' y 'solicitud'
    IF NOT EXISTS (SELECT 1 FROM notificaciones
                    WHERE usuario_id = v_aprendiz_id AND titulo = 'Nueva tarea asignada') THEN
        INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, leida, creado_en)
        VALUES
            (v_aprendiz_id, 'Nueva tarea asignada',
             'Tu instructor te asignó una actividad nueva. Revisa Mis Tareas.',
             'tarea', false, NOW() - INTERVAL '2 hours'),
            (v_aprendiz_id, 'Tarea devuelta',
             'Tu instructor devolvió una entrega con comentarios. Revísala y vuelve a entregarla.',
             'tarea', false, NOW() - INTERVAL '1 day'),
            (v_aprendiz_id, 'Entrega recibida',
             'Tu instructor recibió tu entrega y está en revisión.',
             'tarea', true, NOW() - INTERVAL '3 days');
    END IF;

    RAISE NOTICE 'Listo. Asignaciones creadas en esta corrida: %', v_creadas;
END
$tareas$;

-- ── Comprobación ────────────────────────────────────────────────────────────
-- pgAdmin solo muestra el resultado de la última consulta del script
SELECT
    u.nombre || ' ' || u.apellido                                            AS aprendiz,
    COUNT(*) FILTER (WHERE a.estado IN ('ASIGNADA','EN_PROGRESO','DEVUELTA')) AS "Tareas pendientes",
    COUNT(*) FILTER (WHERE a.estado <> 'APROBADA'
                       AND a.fecha_limite BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS "Por vencer esta semana",
    COUNT(*) FILTER (WHERE a.estado = 'DEVUELTA')                             AS "Devueltas",
    COALESCE(SUM(a.horas_trabajadas), 0)::text || 'h'                         AS "Horas acumuladas",
    (SELECT COUNT(*) FROM notificaciones n WHERE n.usuario_id = u.id)         AS "Notificaciones"
FROM usuarios u
JOIN actividad_asignaciones a ON a.aprendiz_id = u.id AND a.eliminado_en IS NULL
WHERE LOWER(u.correo) = LOWER('Juan13@gmail.com')
GROUP BY u.id, u.nombre, u.apellido;
