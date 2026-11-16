-- ============================================================================
--  AgroSoft - Permisos de Diseño de terreno
--  Proyecto formativo SENA - Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Crea los dos permisos del modulo de diseño de terreno (el de Manuel) y
--    se los reparte a los roles, igual que el analisis de los vuelos de dron:
--
--      terreno.ver      -> Administrador, Instructor y Aprendiz
--      terreno.evaluar  -> Administrador e Instructor
--
--  POR QUE
--    El backend ya pide estos permisos (diseno-terreno.controller.ts), pero
--    ningun seed los creaba: nadie podia ver la evaluacion del terreno ni
--    usar "Diseñar terreno" desde el analisis de un vuelo.
--
--  CUANDO CORRERLO
--    Una vez, despues de traer lo de main. Luego cada usuario cierra sesion
--    y vuelve a entrar.
--
--  COMO SE CORRE
--    Get-Content -Raw -Encoding UTF8 database\seed\11-permisos-terreno.sql |
--      docker exec -i Agrosoft_DB sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
--    Se puede correr las veces que haga falta.
-- ============================================================================

BEGIN;

INSERT INTO permisos (nombre, descripcion, estado) VALUES
    ('terreno.ver',     'Consultar las evaluaciones y el diseño del terreno', 'activo'),
    ('terreno.evaluar', 'Evaluar el terreno de un lote y diseñar la siembra', 'activo')
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

    -- Ver: los tres roles.
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.id
    FROM (VALUES (v_rol_admin), (v_rol_instr), (v_rol_apr)) AS r(rol_id)
    CROSS JOIN permisos p
    WHERE r.rol_id IS NOT NULL
      AND p.nombre = 'terreno.ver'
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);

    -- Evaluar: instructor y administrador (gasta tiempo de calculo e IA).
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT r.rol_id, p.id
    FROM (VALUES (v_rol_admin), (v_rol_instr)) AS r(rol_id)
    CROSS JOIN permisos p
    WHERE r.rol_id IS NOT NULL
      AND p.nombre = 'terreno.evaluar'
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = r.rol_id AND rp.permiso_id = p.id);
END $$;

COMMIT;

SELECT r.nombre AS rol, p.nombre AS permiso
FROM rol_permisos rp
JOIN roles r    ON r.id = rp.rol_id
JOIN permisos p ON p.id = rp.permiso_id
WHERE p.nombre LIKE 'terreno.%'
ORDER BY p.nombre, r.nombre;
