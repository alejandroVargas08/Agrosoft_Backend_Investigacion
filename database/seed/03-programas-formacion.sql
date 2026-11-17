-- ============================================================================
--  AgroSoft — Programas de formación (fichas)
--  Proyecto formativo SENA · Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Inserta las fichas del Centro de Gestión y Desarrollo Sostenible
--    Surcolombiano, y deja al usuario de menor id como instructor de tres de
--    ellas, para que las pantallas del instructor tengan datos que mostrar.
--
--  SE PUEDE CORRER VARIAS VECES
--    Cada inserción está protegida: si la ficha ya existe, se salta. No crea
--    duplicados ni pisa lo que ya haya.
--
--  INDEPENDIENTE DE LOS OTROS SCRIPTS
--    No borra nada y no depende de 01 ni de 02. La tabla programas_formacion
--    no se toca en la limpieza, a propósito.
--
--  COMO SE CORRE
--    pgAdmin → base Agrosoft_DB → Query Tool → abrir este archivo → F5.
-- ============================================================================

DO $fichas$
DECLARE
    v_usuario int;
    v_insertadas int := 0;
    v_vinculadas int := 0;
    r record;
BEGIN
    -- ======================================================================
    -- 1. LAS FICHAS
    --    tipo: libre, pero conviene usar los del SENA
    --    estado: 'activo' | 'inactivo' | 'finalizado'  (lo valida el DTO)
    -- ======================================================================
    FOR r IN
        SELECT * FROM (VALUES
            ('Análisis y Desarrollo de Software',        'Tecnólogo', '3225853', DATE '2025-02-03', DATE '2027-01-29', 'activo'),
            ('Producción Agropecuaria Ecológica',        'Tecnólogo', '2890145', DATE '2025-07-21', DATE '2027-07-16', 'activo'),
            ('Agricultura de Precisión',                 'Tecnólogo', '3010782', DATE '2026-02-02', DATE '2028-01-28', 'activo'),
            ('Manejo Integrado del Cultivo de Café',     'Técnico',   '2967334', DATE '2026-01-19', DATE '2027-04-16', 'activo'),
            ('Producción de Frutales Andinos',           'Técnico',   '3114509', DATE '2026-04-13', DATE '2027-07-09', 'activo'),
            ('Operario Agrícola',                        'Operario',  '2745120', DATE '2026-08-10', DATE '2027-02-05', 'activo'),
            ('Producción Agropecuaria Ecológica',        'Tecnólogo', '2612998', DATE '2023-02-06', DATE '2025-01-31', 'finalizado')
        ) AS f(nombre, tipo, ficha, fecha_inicio, fecha_fin, estado)
    LOOP
        -- La columna ficha no tiene índice único, así que se comprueba a mano
        IF NOT EXISTS (SELECT 1 FROM programas_formacion WHERE ficha = r.ficha) THEN
            INSERT INTO programas_formacion (nombre, tipo, ficha, fecha_inicio, fecha_fin, estado)
            VALUES (r.nombre, r.tipo, r.ficha, r.fecha_inicio, r.fecha_fin, r.estado);
            v_insertadas := v_insertadas + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Fichas insertadas: % (las que ya existían se saltaron)', v_insertadas;

    -- ======================================================================
    -- 2. FICHAS A CARGO
    --    programasPermitidos sale de esta tabla MÁS el programa_formacion_id
    --    del propio usuario. Sin filas aquí, GET /mi-acceso/programas devuelve
    --    vacío y la pantalla Mis Fichas sale sin nada.
    -- ======================================================================
    SELECT MIN(id) INTO v_usuario FROM usuarios WHERE eliminado_en IS NULL;

    IF v_usuario IS NULL THEN
        RAISE NOTICE 'No hay usuarios: no se asignaron fichas a cargo.';
    ELSE
        FOR r IN
            SELECT id FROM programas_formacion
            WHERE ficha IN ('2890145', '3010782', '2967334')
        LOOP
            IF NOT EXISTS (
                SELECT 1 FROM usuario_programas_formacion
                WHERE usuario_id = v_usuario AND programa_formacion_id = r.id
            ) THEN
                INSERT INTO usuario_programas_formacion (usuario_id, programa_formacion_id)
                VALUES (v_usuario, r.id);
                v_vinculadas := v_vinculadas + 1;
            END IF;
        END LOOP;
        RAISE NOTICE 'Fichas puestas a cargo del usuario %: %', v_usuario, v_vinculadas;
    END IF;
END
$fichas$;

-- ============================================================================
--  COMPROBACION
-- ============================================================================

-- Las fichas que quedaron
SELECT id, ficha, nombre, tipo, fecha_inicio, fecha_fin, estado
FROM programas_formacion
ORDER BY estado, ficha;

-- Qué fichas vería cada usuario en Mis Fichas.
-- Es la misma regla que aplica ContextoAccesoService: las de la tabla puente
-- más la propia del usuario.
SELECT u.id,
       u.nombre || ' ' || COALESCE(u.apellido, '') AS usuario,
       r.nombre AS rol,
       COALESCE(
         (SELECT string_agg(DISTINCT p.ficha, ', ' ORDER BY p.ficha)
          FROM programas_formacion p
          WHERE p.id IN (
              SELECT up.programa_formacion_id FROM usuario_programas_formacion up WHERE up.usuario_id = u.id
              UNION
              SELECT u.programa_formacion_id WHERE u.programa_formacion_id IS NOT NULL
          )),
         '(ninguna)'
       ) AS fichas_que_ve
FROM usuarios u
LEFT JOIN roles r ON r.id = u.rol_id
WHERE u.eliminado_en IS NULL
ORDER BY u.id;

-- Los permisos que hacen falta para ver cada pantalla del instructor.
-- Si alguna sale en 'NO', esa pantalla no aparece en el menú.
SELECT u.id,
       u.correo,
       CASE WHEN bool_or(p.nombre = 'actividades.asignar')  THEN 'si' ELSE 'NO' END AS panel_y_mis_fichas,
       CASE WHEN bool_or(p.nombre = 'actividades.revisar')  THEN 'si' ELSE 'NO' END AS por_revisar,
       CASE WHEN bool_or(p.nombre = 'actividades.ejecutar') THEN 'si' ELSE 'NO' END AS mis_tareas,
       CASE WHEN bool_or(p.nombre = 'fichas.ver_todas')     THEN 'si' ELSE 'NO' END AS ve_todas_las_fichas
FROM usuarios u
LEFT JOIN rol_permisos rp ON rp.rol_id = u.rol_id
LEFT JOIN permisos p ON p.id = rp.permiso_id
WHERE u.eliminado_en IS NULL
GROUP BY u.id, u.correo
ORDER BY u.id;
