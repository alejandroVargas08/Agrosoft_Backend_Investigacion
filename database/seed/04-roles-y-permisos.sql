-- ============================================================================
--  AgroSoft - Roles y permisos
--  Proyecto formativo SENA · Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Siembra los 19 permisos que el backend consulta, crea los tres roles
--    del sistema y se los reparte. Despues le pone rol a cada usuario.
--
--  POR QUE EXISTE
--    El backend NO siembra nada de IAM al arrancar. Con las tablas 'roles' y
--    'permisos' vacias, ninguna pantalla con permiso aparece en el menu.
--
--  SE PUEDE CORRER VARIAS VECES
--    Todo esta protegido: lo que ya existe se salta, nada se duplica.
--
--  INDEPENDIENTE DE LOS OTROS SCRIPTS
--    No toca datos operativos. Si el 03 ya corrio, le aprovecha las fichas.
--
--  >>> ANTES DE CORRERLO: revisa los tres correos de abajo <<<
-- ============================================================================

DO $iam$
DECLARE
    -- ---- A QUIEN LE TOCA CADA ROL (cambia los correos si no son estos) ----
    v_correo_admin    text := 'ItsJuan12@gmail.com';
    v_correo_instr    text := 'carlos12@gmail.com';
    v_correo_aprendiz text := 'Juan13@gmail.com';

    v_rol_admin int;
    v_rol_instr int;
    v_rol_apr   int;
    v_id_admin  int;
    v_id_instr  int;
    v_id_apr    int;
    v_ficha     int;
    v_fichas    int;

    -- Lo que puede cada rol. El administrador recibe todo, no se lista.
    c_instructor text[] := ARRAY[
        'lotes.ver', 'cultivos.ver', 'cultivos.gestionar',
        'actividades.ver', 'actividades.gestionar',
        'actividades.asignar', 'actividades.revisar',
        'incidencias.ver', 'incidencias.gestionar',
        'drones.ver', 'vuelos.ver', 'analisis.solicitar'
    ];
    c_aprendiz text[] := ARRAY[
        'lotes.ver', 'cultivos.ver',
        'actividades.ver', 'actividades.ejecutar',
        'incidencias.ver', 'incidencias.gestionar'
    ];
BEGIN
    -- ======================================================================
    -- 1. Los 19 permisos que el backend consulta
    -- ======================================================================
    INSERT INTO permisos (nombre, descripcion, estado) VALUES
        ('usuarios.gestionar',      'Administrar usuarios, roles, permisos y fichas', 'activo'),
        ('fichas.ver_todas',        'Ver todas las fichas, no solo las propias',      'activo'),
        ('lotes.ver',               'Consultar lotes y sublotes',                     'activo'),
        ('lotes.gestionar',         'Crear y editar lotes y sublotes',                'activo'),
        ('cultivos.ver',            'Consultar cultivos',                             'activo'),
        ('cultivos.gestionar',      'Crear y editar cultivos',                        'activo'),
        ('actividades.ver',         'Consultar actividades',                          'activo'),
        ('actividades.gestionar',   'Crear y editar actividades',                     'activo'),
        ('actividades.asignar',     'Asignar tareas a aprendices y ver sus fichas',   'activo'),
        ('actividades.revisar',     'Aprobar y devolver entregas',                    'activo'),
        ('actividades.ejecutar',    'Iniciar y entregar sus propias tareas',          'activo'),
        ('incidencias.ver',         'Consultar incidencias y tratamientos',           'activo'),
        ('incidencias.gestionar',   'Registrar incidencias y tratamientos',           'activo'),
        ('drones.ver',              'Consultar drones',                               'activo'),
        ('drones.gestionar',        'Crear y editar drones',                          'activo'),
        ('vuelos.ver',              'Consultar vuelos y sus analisis',                'activo'),
        ('vuelos.gestionar',        'Programar y editar vuelos',                      'activo'),
        ('vuelos.cargar_imagenes',  'Subir imagenes de un vuelo',                     'activo'),
        ('analisis.solicitar',      'Pedir el analisis de un vuelo',                  'activo')
    ON CONFLICT (nombre) DO NOTHING;

    -- ======================================================================
    -- 2. Los tres roles del sistema
    -- ======================================================================
    INSERT INTO roles (nombre, descripcion, es_sistema, estado) VALUES
        ('Administrador', 'Acceso total al sistema',                        true, 'activo'),
        ('Instructor',    'Asigna tareas, revisa entregas y atiende novedades', true, 'activo'),
        ('Aprendiz',      'Ejecuta sus tareas y reporta novedades',         true, 'activo')
    ON CONFLICT (nombre) DO NOTHING;

    SELECT id INTO v_rol_admin FROM roles WHERE nombre = 'Administrador';
    SELECT id INTO v_rol_instr FROM roles WHERE nombre = 'Instructor';
    SELECT id INTO v_rol_apr   FROM roles WHERE nombre = 'Aprendiz';

    -- ======================================================================
    -- 3. Que puede cada rol
    -- ======================================================================
    -- Administrador: todos los permisos que existan
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_rol_admin, p.id
    FROM permisos p
    WHERE p.eliminado_en IS NULL
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = v_rol_admin AND rp.permiso_id = p.id);

    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_rol_instr, p.id
    FROM permisos p
    WHERE p.nombre = ANY(c_instructor)
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = v_rol_instr AND rp.permiso_id = p.id);

    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_rol_apr, p.id
    FROM permisos p
    WHERE p.nombre = ANY(c_aprendiz)
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = v_rol_apr AND rp.permiso_id = p.id);

    -- ======================================================================
    -- 4. Que rol tiene cada usuario
    -- ======================================================================
    SELECT id INTO v_id_admin FROM usuarios
     WHERE LOWER(correo) = LOWER(v_correo_admin) AND eliminado_en IS NULL;
    SELECT id INTO v_id_instr FROM usuarios
     WHERE LOWER(correo) = LOWER(v_correo_instr) AND eliminado_en IS NULL;
    SELECT id INTO v_id_apr FROM usuarios
     WHERE LOWER(correo) = LOWER(v_correo_aprendiz) AND eliminado_en IS NULL;

    IF v_id_admin IS NULL THEN
        RAISE EXCEPTION 'No existe el usuario %. Corrige v_correo_admin arriba.', v_correo_admin;
    END IF;

    UPDATE usuarios SET rol_id = v_rol_admin, estado = 'activo' WHERE id = v_id_admin;
    IF v_id_instr IS NOT NULL THEN
        UPDATE usuarios SET rol_id = v_rol_instr, estado = 'activo' WHERE id = v_id_instr;
    END IF;
    IF v_id_apr IS NOT NULL THEN
        UPDATE usuarios SET rol_id = v_rol_apr, estado = 'activo' WHERE id = v_id_apr;
    END IF;

    -- Cualquier otro usuario sin rol valido queda de aprendiz
    UPDATE usuarios SET rol_id = v_rol_apr
     WHERE eliminado_en IS NULL
       AND rol_id NOT IN (v_rol_admin, v_rol_instr, v_rol_apr);

    -- ======================================================================
    -- 5. Que el instructor tenga fichas, y el aprendiz este en una de ellas
    -- ======================================================================
    IF v_id_instr IS NOT NULL THEN
        SELECT COUNT(*) INTO v_fichas
          FROM usuario_programas_formacion WHERE usuario_id = v_id_instr;

        -- Sin fichas no ve ningun aprendiz: se le dan las tres primeras activas
        IF v_fichas = 0 THEN
            INSERT INTO usuario_programas_formacion (usuario_id, programa_formacion_id)
            SELECT v_id_instr, pf.id
            FROM programas_formacion pf
            WHERE LOWER(pf.estado) = 'activo'
            ORDER BY pf.id
            LIMIT 3
            ON CONFLICT DO NOTHING;
        END IF;

        SELECT programa_formacion_id INTO v_ficha
          FROM usuario_programas_formacion
         WHERE usuario_id = v_id_instr
         ORDER BY programa_formacion_id
         LIMIT 1;

        -- El aprendiz tiene que estar en una ficha del instructor, o no lo ve
        IF v_ficha IS NOT NULL AND v_id_apr IS NOT NULL THEN
            UPDATE usuarios SET programa_formacion_id = v_ficha WHERE id = v_id_apr;
        END IF;
    END IF;

    RAISE NOTICE 'Listo. Administrador=%, Instructor=%, Aprendiz=%, ficha del aprendiz=%',
                 v_id_admin, v_id_instr, v_id_apr, v_ficha;
END
$iam$;

-- ============================================================================
--  COMPROBACION
-- ============================================================================
SELECT u.id,
       u.correo,
       r.nombre AS rol,
       COALESCE(pf.ficha, '—') AS su_ficha,
       (SELECT COUNT(*) FROM usuario_programas_formacion upf
         WHERE upf.usuario_id = u.id) AS fichas_a_cargo,
       (SELECT COUNT(*) FROM rol_permisos rp
         WHERE rp.rol_id = u.rol_id AND rp.eliminado_en IS NULL) AS permisos,
       CASE WHEN EXISTS (SELECT 1 FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
             WHERE rp.rol_id = u.rol_id AND p.nombre = 'actividades.asignar')  THEN 'SI' ELSE 'NO' END AS panel_y_fichas,
       CASE WHEN EXISTS (SELECT 1 FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
             WHERE rp.rol_id = u.rol_id AND p.nombre = 'actividades.revisar')  THEN 'SI' ELSE 'NO' END AS por_revisar,
       CASE WHEN EXISTS (SELECT 1 FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
             WHERE rp.rol_id = u.rol_id AND p.nombre = 'actividades.ejecutar') THEN 'SI' ELSE 'NO' END AS mis_tareas,
       CASE WHEN EXISTS (SELECT 1 FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
             WHERE rp.rol_id = u.rol_id AND p.nombre = 'usuarios.gestionar')   THEN 'SI' ELSE 'NO' END AS administracion,
       CASE WHEN EXISTS (SELECT 1 FROM rol_permisos rp JOIN permisos p ON p.id = rp.permiso_id
             WHERE rp.rol_id = u.rol_id AND p.nombre = 'fichas.ver_todas')     THEN 'SI' ELSE 'NO' END AS ve_todas_las_fichas
FROM usuarios u
LEFT JOIN roles r               ON r.id  = u.rol_id
LEFT JOIN programas_formacion pf ON pf.id = u.programa_formacion_id
WHERE u.eliminado_en IS NULL
ORDER BY u.id;
