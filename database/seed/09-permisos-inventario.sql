-- ============================================================================
--  AgroSoft - Permisos de Inventario
--  Proyecto formativo SENA - Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Crea los dos permisos de inventario y se los reparte a los roles:
--
--      inventario.ver        -> Administrador, Instructor y Aprendiz
--      inventario.gestionar  -> Administrador e Instructor
--
--  POR QUE
--    Los controllers de insumos, almacenes, categorias, proveedores y
--    movimientos solo pedian haber iniciado sesion: un aprendiz podia crear
--    insumos o registrar entradas y ajustes llamando la API. Ahora consultar
--    pide inventario.ver y registrar pide inventario.gestionar.
--    (Las reservas siguen como estaban: las maneja el flujo de actividades.)
--
--  CUANDO CORRERLO
--    ANTES de reiniciar el backend con los guardias puestos. Si se reinicia
--    primero, la pantalla de Inventario devuelve 403 hasta que esto se corra.
--    Despues, cada usuario debe cerrar sesion y volver a entrar.
--
--  COMO SE CORRE
--    Get-Content database\seed\09-permisos-inventario.sql -Raw |
--      docker exec -i Agrosoft_DB psql -U Agrosoft -d Agrosoft_DB
--    Se puede correr las veces que haga falta.
-- ============================================================================

BEGIN;

INSERT INTO permisos (nombre, descripcion, estado) VALUES
    ('inventario.ver',       'Consultar insumos, almacenes y movimientos', 'activo'),
    ('inventario.gestionar', 'Registrar insumos, almacenes y movimientos', 'activo')
ON CONFLICT (nombre) DO NOTHING;

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

    -- Ver: los tres roles. El aprendiz consulta el inventario.
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.id
    FROM (VALUES (v_rol_admin), (v_rol_instr), (v_rol_apr)) AS r(rol_id)
    CROSS JOIN permisos p
    WHERE r.rol_id IS NOT NULL
      AND p.nombre = 'inventario.ver'
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);

    -- Gestionar: instructor y administrador.
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.id
    FROM (VALUES (v_rol_admin), (v_rol_instr)) AS r(rol_id)
    CROSS JOIN permisos p
    WHERE r.rol_id IS NOT NULL
      AND p.nombre = 'inventario.gestionar'
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);
END $$;

COMMIT;

SELECT r.nombre AS rol, p.nombre AS permiso
FROM rol_permisos rp
JOIN roles r    ON r.id = rp.rol_id
JOIN permisos p ON p.id = rp.permiso_id
WHERE p.nombre LIKE 'inventario.%'
ORDER BY p.nombre, r.nombre;
