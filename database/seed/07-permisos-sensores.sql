    -- ============================================================================
    --  AgroSoft - Permisos de sensores IoT
    --  Proyecto formativo SENA - Juan David Perdomo Valencia
    -- ============================================================================
    --  QUE HACE
    --    Crea los dos permisos de sensores y se los reparte a los roles:
    --
    --      sensores.ver        -> Administrador, Instructor y Aprendiz
    --      sensores.gestionar  -> Administrador e Instructor
    --
    --  POR QUE
    --    Hasta ahora el controller de sensores no exigia nada: cualquiera podia
    --    crear, editar o borrar un sensor sin siquiera iniciar sesion. Con el
    --    cambio del backend esos endpoints quedan protegidos, y sin estos
    --    permisos nadie podria ni ver la pantalla de Sensores IoT.
    --
    --  CUANDO CORRERLO
    --    ANTES de reiniciar el backend con los guardias puestos. Si se reinicia
    --    primero, la pantalla de sensores devuelve 403 hasta que esto se corra.
    --
    --  COMO SE CORRE
    --    pgAdmin -> base Agrosoft_DB -> Query Tool -> abrir este archivo -> F5.
    --    Se puede correr las veces que haga falta.
    -- ============================================================================

    BEGIN;

    -- ── Los permisos ────────────────────────────────────────────────────────────
    INSERT INTO permisos (nombre, descripcion, estado) VALUES
        ('sensores.ver',       'Consultar sensores y sus lecturas',        'activo'),
        ('sensores.gestionar', 'Registrar, editar rangos y borrar sensores', 'activo')
    ON CONFLICT (nombre) DO NOTHING;

    -- ── Quien los tiene ─────────────────────────────────────────────────────────
    DO $$
    DECLARE
        v_rol_admin int;
        v_rol_instr int;
        v_rol_apr   int;
    BEGIN
        SELECT id INTO v_rol_admin FROM roles WHERE LOWER(nombre) = 'administrador';
        SELECT id INTO v_rol_instr FROM roles WHERE LOWER(nombre) = 'instructor';
        SELECT id INTO v_rol_apr   FROM roles WHERE LOWER(nombre) = 'aprendiz';

        IF v_rol_admin IS NULL THEN
            RAISE EXCEPTION 'No existe el rol Administrador. Corre primero el seed 04.';
        END IF;

        -- Ver: los tres roles. El aprendiz consulta la pantalla de Sensores IoT.
        INSERT INTO rol_permisos (rol_id, permiso_id)
        SELECT r.rol_id, p.id
        FROM (VALUES (v_rol_admin), (v_rol_instr), (v_rol_apr)) AS r(rol_id)
        CROSS JOIN permisos p
        WHERE r.rol_id IS NOT NULL
        AND p.nombre = 'sensores.ver'
        AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                        WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);

        -- Gestionar: solo quien puede tocar la configuracion de un sensor.
        INSERT INTO rol_permisos (rol_id, permiso_id)
        SELECT r.rol_id, p.id
        FROM (VALUES (v_rol_admin), (v_rol_instr)) AS r(rol_id)
        CROSS JOIN permisos p
        WHERE r.rol_id IS NOT NULL
        AND p.nombre = 'sensores.gestionar'
        AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                        WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);
    END $$;

    COMMIT;

    -- ============================================================================
    --  Comprobacion: quien quedo con que.
    -- ============================================================================
    SELECT r.nombre AS rol, p.nombre AS permiso
    FROM rol_permisos rp
    JOIN roles r    ON r.id = rp.rol_id
    JOIN permisos p ON p.id = rp.permiso_id
    WHERE p.nombre LIKE 'sensores.%'
    ORDER BY p.nombre, r.nombre;
