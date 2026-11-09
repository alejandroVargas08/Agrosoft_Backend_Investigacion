-- ============================================================================
-- 08 - Asignaciones para el panel del instructor
-- ----------------------------------------------------------------------------
-- Llena lo que el panel necesita y la base no tiene:
--   * entregas esperando revision          -> contador "Por revisar"
--   * tareas aprobadas repartidas en 6 semanas -> grafica "Tareas aprobadas por semana"
--   * asignaciones activas con plazo por delante -> "Proximas fechas limite"
--
-- No toca las asignaciones que ya existan: solo agrega las que falten.
-- Se puede correr varias veces, no duplica.
-- ============================================================================

DO $$
DECLARE
    v_instructor     int;
    v_aprendices     int[];
    v_actividades    int[];
    v_n_aprendices   int;
    v_n_actividades  int;
    v_aprendiz       int;
    v_actividad      int;
    ia               int;
    iac              int;
    v_semana         int;
    v_creadas        int := 0;
    v_aprobadas      int := 0;
    v_estado         varchar(20);
    v_fecha_limite   date;
    v_iniciada       timestamp;
    v_entregada      timestamp;
    v_revisada       timestamp;
    v_revisor        int;
    v_horas          float;
    v_comentario     text;
BEGIN
    -- ── Quien asigna ────────────────────────────────────────────────────────
    SELECT u.id INTO v_instructor
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    WHERE r.nombre = 'Instructor' AND u.eliminado_en IS NULL
    ORDER BY u.id
    LIMIT 1;

    IF v_instructor IS NULL THEN
        RAISE NOTICE 'No hay ningun instructor. Corre antes el 04-roles-y-permisos.sql.';
        RETURN;
    END IF;

    -- ── A quien se le asigna ────────────────────────────────────────────────
    SELECT array_agg(u.id ORDER BY u.id) INTO v_aprendices
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    WHERE r.nombre = 'Aprendiz' AND u.eliminado_en IS NULL;

    -- ── Sobre que actividades ───────────────────────────────────────────────
    SELECT array_agg(a.id ORDER BY a.id) INTO v_actividades
    FROM actividades a;

    v_n_aprendices  := coalesce(array_length(v_aprendices, 1), 0);
    v_n_actividades := coalesce(array_length(v_actividades, 1), 0);

    IF v_n_aprendices = 0 OR v_n_actividades = 0 THEN
        RAISE NOTICE 'Faltan datos: % aprendices, % actividades.', v_n_aprendices, v_n_actividades;
        RETURN;
    END IF;

    RAISE NOTICE 'Instructor %, % aprendices, % actividades.', v_instructor, v_n_aprendices, v_n_actividades;

    -- ── Una tanda de hasta 6 actividades por aprendiz ───────────────────────
    -- El reparto es a proposito: las actividades 4, 5 y 6 quedan activas con
    -- plazo por delante y las comparten todos los aprendices, que es lo que
    -- agrupa la tarjeta de proximas fechas limite.
    FOR ia IN 1..v_n_aprendices LOOP
        v_aprendiz := v_aprendices[ia];

        FOR iac IN 1..least(6, v_n_actividades) LOOP
            v_actividad := v_actividades[iac];

            CONTINUE WHEN EXISTS (
                SELECT 1 FROM actividad_asignaciones
                WHERE actividad_id = v_actividad
                  AND aprendiz_id  = v_aprendiz
                  AND eliminado_en IS NULL
            );

            v_estado       := NULL;
            v_fecha_limite := NULL;
            v_iniciada     := NULL;
            v_entregada    := NULL;
            v_revisada     := NULL;
            v_revisor      := NULL;
            v_horas        := NULL;
            v_comentario   := NULL;

            IF iac IN (1, 2) THEN
                -- Aprobadas, repartidas entre las ultimas 6 semanas
                -- Una por semana, dando la vuelta: asi las 6 barras quedan con dato
                v_semana       := v_aprobadas % 6;
                v_aprobadas    := v_aprobadas + 1;
                v_revisada     := date_trunc('week', now()) - (v_semana * interval '7 days') + interval '2 days 10 hours';
                v_entregada    := v_revisada - interval '1 day';
                v_iniciada     := v_entregada - interval '3 days';
                v_fecha_limite := (v_revisada + interval '1 day')::date;
                v_estado       := 'APROBADA';
                v_revisor      := v_instructor;
                v_horas        := 4 + ((ia + iac) % 5);
                v_comentario   := 'Trabajo entregado completo.';

            ELSIF iac = 3 THEN
                -- Entregada y esperando revision
                v_estado       := 'ENTREGADA';
                v_entregada    := now() - interval '1 day';
                v_iniciada     := now() - interval '4 days';
                v_fecha_limite := (CURRENT_DATE + 2);
                v_horas        := 5 + (ia % 3);
                v_comentario   := 'Terminado, adjunto las evidencias.';

            ELSIF iac = 4 THEN
                v_estado       := 'EN_PROGRESO';
                v_iniciada     := now() - interval '2 days';
                v_fecha_limite := (CURRENT_DATE + 3);

            ELSIF iac = 5 THEN
                v_estado       := 'ASIGNADA';
                v_fecha_limite := (CURRENT_DATE + 5);

            ELSE
                v_estado       := 'ASIGNADA';
                v_fecha_limite := (CURRENT_DATE + 10);
            END IF;

            INSERT INTO actividad_asignaciones (
                actividad_id, aprendiz_id, asignado_por_id, estado, fecha_limite,
                horas_trabajadas, comentario_aprendiz, comentario_instructor,
                iniciada_en, entregada_en, revisada_en, revisada_por_id,
                creado_en, actualizado_en
            ) VALUES (
                v_actividad, v_aprendiz, v_instructor, v_estado, v_fecha_limite,
                v_horas, v_comentario, NULL,
                v_iniciada, v_entregada, v_revisada, v_revisor,
                coalesce(v_iniciada, now() - interval '7 days'), now()
            );

            v_creadas := v_creadas + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Asignaciones creadas: %', v_creadas;
END $$;

-- ── Como quedo ──────────────────────────────────────────────────────────────
SELECT estado,
       COUNT(*)                                             AS cuantas,
       COUNT(*) FILTER (WHERE fecha_limite >= CURRENT_DATE) AS con_plazo_por_delante,
       COUNT(revisada_en)                                   AS revisadas
FROM actividad_asignaciones
WHERE eliminado_en IS NULL
GROUP BY estado
ORDER BY estado;
