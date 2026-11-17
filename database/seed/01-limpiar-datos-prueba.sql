-- ============================================================================
--  AgroSoft — Limpieza de datos de prueba
--  Proyecto formativo SENA · Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Borra TODOS los datos operativos y reinicia los contadores de id.
--
--  QUE NO TOCA
--    usuarios, roles, permisos, rol_permisos, permisos_de_usuarios,
--    programas_formacion, usuario_programas_formacion, email_codes,
--    telegram_usuarios, iot_global_config.
--    Tu cuenta y tus permisos quedan intactos: no hay que volver a registrarse.
--
--  COMO SE CORRE
--    pgAdmin → base Agrosoft_DB → Query Tool → abrir este archivo → F5.
--
--  ADVERTENCIA
--    Esto no se puede deshacer. Si hay algo que quieras conservar,
--    saca un respaldo antes (pgAdmin → clic derecho en la base → Backup).
-- ============================================================================

BEGIN;

TRUNCATE TABLE
    -- comercial (primero lo que apunta a ventas)
    historial_precios_lote,
    transaccion_financiera,
    pagos,
    facturas,
    ventas_detalles,
    ventas,
    clientes,
    finanzas,

    -- produccion
    movimientos_produccion,
    lotes_produccion,
    actividades_evidencias,
    actividades_herramientas,
    actividad_historial,
    actividades_insumos_reserva,
    actividades_insumos_uso,
    actividad_insumos,
    actividades_responsables,
    actividades_servicios,
    actividad_asignaciones,
    actividades,
    usos_herramientas,
    tratamientos,
    incidencias,
    cultivo_historial,
    cultivos,
    productos_agro,

    -- inventario
    reservas,
    movimientos_insumos,
    insumos,
    categorias,
    almacenes,
    proveedores,

    -- iot
    sensor_alertas,
    sensor_lecturas,
    sensores,
    tipos_sensores,

    -- wiki epa
    epas,
    tipos_cultivos_wiki,
    wiki_tipo_epa,

    -- territorio (al final: casi todo apunta aca)
    sublotes,
    lotes,

    -- otros
    notificaciones,
    telegram_form_estado
RESTART IDENTITY CASCADE;

COMMIT;

-- Comprobacion: todas las filas deben quedar en 0
SELECT 'lotes' AS tabla, COUNT(*) FROM lotes
UNION ALL SELECT 'cultivos', COUNT(*) FROM cultivos
UNION ALL SELECT 'lotes_produccion', COUNT(*) FROM lotes_produccion
UNION ALL SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL SELECT 'finanzas', COUNT(*) FROM finanzas
UNION ALL SELECT 'sensor_alertas', COUNT(*) FROM sensor_alertas
UNION ALL SELECT 'insumos', COUNT(*) FROM insumos
UNION ALL SELECT 'epas', COUNT(*) FROM epas
UNION ALL SELECT 'usuarios (NO se toca)', COUNT(*) FROM usuarios;
