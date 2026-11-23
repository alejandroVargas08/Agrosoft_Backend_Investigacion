-- ============================================================================
--  AgroSoft - Cultivos susceptibles de la Wiki EPA
--  Proyecto formativo SENA - Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Une cada ficha de la Wiki EPA con los tipos de cultivo de la wiki
--    (tipos_cultivos_wiki) que nombra en sus etiquetas: "Broca del cafe" lleva
--    la etiqueta "Cafe", asi que queda unida al cultivo Cafe. Llena la tabla
--    epa_cultivos_susceptibles, que TypeORM crea al arrancar el backend.
--
--  POR QUE
--    La pantalla de la wiki muestra "Cultivos susceptibles" como en el Figma,
--    y tipos_cultivos_wiki estaba huerfana: nada apuntaba a ella.
--
--  CUANDO CORRERLO
--    Despues de arrancar el backend una vez con este cambio (para que exista la
--    tabla). Se puede correr las veces que haga falta: no duplica.
--
--  COMO SE CORRE
--    Get-Content -Raw -Encoding UTF8 database\seed\13-epa-cultivos-susceptibles.sql |
--      docker exec -i Agrosoft_DB sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
-- ============================================================================

BEGIN;

INSERT INTO epa_cultivos_susceptibles (epa_id, tipo_cultivo_wiki_id)
SELECT DISTINCT e.id, t.id
FROM epas e
CROSS JOIN LATERAL unnest(e.etiquetas) AS etiqueta
JOIN tipos_cultivos_wiki t
  ON LOWER(TRANSLATE(t.nombre, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'))
   = LOWER(TRANSLATE(etiqueta,  'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'))
WHERE e.eliminado_en IS NULL
  AND t.eliminado_en IS NULL
  AND NOT EXISTS (SELECT 1 FROM epa_cultivos_susceptibles x
                  WHERE x.epa_id = e.id AND x.tipo_cultivo_wiki_id = t.id);

COMMIT;

SELECT e.nombre AS epa, STRING_AGG(t.nombre, ', ' ORDER BY t.nombre) AS cultivos_susceptibles
FROM epas e
LEFT JOIN epa_cultivos_susceptibles x ON x.epa_id = e.id
LEFT JOIN tipos_cultivos_wiki t ON t.id = x.tipo_cultivo_wiki_id
WHERE e.eliminado_en IS NULL
GROUP BY e.nombre
ORDER BY e.nombre;
