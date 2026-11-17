-- ============================================================================
--  AgroSoft - El aprendiz consulta drones y vuelos
--  Proyecto formativo SENA - Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Le da al rol Aprendiz los permisos de solo consulta de drones:
--
--      drones.ver   -> ver los drones registrados
--      vuelos.ver   -> ver los vuelos, sus capturas y su analisis
--
--  POR QUE
--    El menu del aprendiz (Figma) trae "Drones" y el acta de requerimientos
--    dice que los tres perfiles consultan los vuelos de dron. Sin estos dos
--    permisos la pantalla le respondia "No tienes permiso (drones.ver)".
--    Registrar drones, crear vuelos, cargar imagenes y pedir analisis sigue
--    siendo de instructor y administrador.
--
--  COMO SE CORRE
--    Get-Content -Raw -Encoding UTF8 database\seed\12-aprendiz-ve-drones.sql |
--      docker exec -i Agrosoft_DB sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
--    Se puede correr las veces que haga falta. Luego el aprendiz cierra sesion
--    y vuelve a entrar.
-- ============================================================================

BEGIN;

DO $$
DECLARE
    v_rol_apr int;
BEGIN
    SELECT id INTO v_rol_apr FROM roles WHERE LOWER(nombre) = 'aprendiz';
    IF v_rol_apr IS NULL THEN
        RAISE EXCEPTION 'No existe el rol Aprendiz. Corre primero el seed 04.';
    END IF;

    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_rol_apr, p.id
    FROM permisos p
    WHERE p.nombre IN ('drones.ver', 'vuelos.ver')
      AND NOT EXISTS (SELECT 1 FROM rol_permisos rp
                      WHERE rp.rol_id = v_rol_apr AND rp.permiso_id = p.id);
END $$;

COMMIT;

SELECT r.nombre AS rol, p.nombre AS permiso
FROM rol_permisos rp
JOIN roles r    ON r.id = rp.rol_id
JOIN permisos p ON p.id = rp.permiso_id
WHERE p.nombre IN ('drones.ver', 'vuelos.ver')
ORDER BY p.nombre, r.nombre;
