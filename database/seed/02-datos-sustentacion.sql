-- ============================================================================
--  AgroSoft — Datos coherentes para la sustentacion
--  Proyecto formativo SENA · Juan David Perdomo Valencia
--  Contexto: finca cafetera en Pitalito, Huila
-- ============================================================================
--  REQUISITO
--    Correr primero 01-limpiar-datos-prueba.sql.
--    Las tablas de usuarios/roles/permisos tienen que tener al menos un
--    usuario: el script toma el de menor id como autor de todo.
--
--  COMO SE CORRE
--    pgAdmin → base Agrosoft_DB → Query Tool → abrir este archivo → F5.
--
--  QUE QUEDA ARMADO
--    3 lotes con geometria real cerca de Pitalito y 3 sublotes
--    5 productos agricolas y 5 cultivos (4 activos, 1 finalizado)
--    7 cosechas repartidas entre mayo y octubre de 2026 (2.860 kg)
--    4 clientes y 5 ventas: 2 pagadas, 2 pendientes, 1 anulada
--    9 movimientos de finanzas (7 egresos, 2 ingresos)
--    5 insumos (2 quedan bajo el minimo, para que suenen las alertas)
--    4 sensores con 3 alertas activas
--    6 actividades (3 generan alerta: vencida, de hoy y de pasado manana)
--    3 incidencias con 3 tratamientos
--    5 fichas de Wiki EPA
--
--  NUMEROS QUE DEBE MOSTRAR LA PANTALLA DE REPORTES (periodo mensual)
--    Produccion total .... 2.860 kg
--    Unidades activas .... 4
--    Ingresos ............ $ 7.660.000   (no cuenta la venta anulada)
--    Egresos ............. $ 5.075.000
--    Rentabilidad ........ 34 %
-- ============================================================================

DO $seed$
DECLARE
    v_usuario   int;

    g           geometry;
    v_l1        int; v_l2 int; v_l3 int;
    v_s1        int; v_s2 int; v_s3 int;

    v_p_cafe    int; v_p_mora int; v_p_lulo int; v_p_agua int; v_p_plat int;

    v_c_cafe    int; v_c_mora int; v_c_lulo int; v_c_agua int; v_c_plat int;

    v_lp1 int; v_lp2 int; v_lp3 int; v_lp4 int; v_lp5 int; v_lp6 int; v_lp7 int;

    v_cl1 int; v_cl2 int; v_cl3 int; v_cl4 int;

    v_v1 int; v_v2 int; v_v3 int; v_v4 int; v_v5 int;

    v_alm1 int; v_alm2 int;
    v_prov1 int; v_prov2 int;
    v_cat_fert int; v_cat_fung int; v_cat_herr int;

    v_ts_temp int; v_ts_hum int; v_ts_ph int; v_ts_luz int;
    v_sn1 int; v_sn2 int; v_sn3 int; v_sn4 int;

    v_inc1 int; v_inc3 int;
BEGIN
    SELECT MIN(id) INTO v_usuario FROM usuarios WHERE eliminado_en IS NULL;
    IF v_usuario IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base. Registrate primero y vuelve a correr este script.';
    END IF;
    RAISE NOTICE 'Autor de los datos: usuario id %', v_usuario;

    -- Guarda: si ya hay datos, no se vuelve a sembrar. Correr el seed dos
    -- veces chocaria con la identificacion unica de los clientes.
    IF EXISTS (SELECT 1 FROM lotes LIMIT 1)
       OR EXISTS (SELECT 1 FROM cultivos LIMIT 1)
       OR EXISTS (SELECT 1 FROM ventas LIMIT 1)
       OR EXISTS (SELECT 1 FROM clientes LIMIT 1) THEN
        RAISE EXCEPTION 'La base ya tiene datos. Corre primero 01-limpiar-datos-prueba.sql y vuelve a intentar.';
    END IF;

    -- ======================================================================
    -- 1. TERRITORIO
    --    programa_formacion_id queda en NULL a proposito: asi los lotes
    --    los ve cualquier usuario, sin importar su ficha.
    -- ======================================================================
    g := ST_GeomFromText('POLYGON((-76.0520 1.8540, -76.0509 1.8540, -76.0509 1.8549, -76.0520 1.8549, -76.0520 1.8540))', 4326);
    INSERT INTO lotes (nombre, geom, "areaM2", "areaHa", centroide, descripcion, programa_formacion_id, estado)
    VALUES ('Lote La Esperanza', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'Ladera alta, suelo franco. Cafe y mora.', NULL, 'activo')
    RETURNING id INTO v_l1;

    g := ST_GeomFromText('POLYGON((-76.0495 1.8525, -76.0487 1.8525, -76.0487 1.8533, -76.0495 1.8533, -76.0495 1.8525))', 4326);
    INSERT INTO lotes (nombre, geom, "areaM2", "areaHa", centroide, descripcion, programa_formacion_id, estado)
    VALUES ('Lote El Mirador', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'Terreno plano con riego por goteo. Lulo.', NULL, 'activo')
    RETURNING id INTO v_l2;

    g := ST_GeomFromText('POLYGON((-76.0470 1.8555, -76.0455 1.8555, -76.0455 1.8566, -76.0470 1.8566, -76.0470 1.8555))', 4326);
    INSERT INTO lotes (nombre, geom, "areaM2", "areaHa", centroide, descripcion, programa_formacion_id, estado)
    VALUES ('Lote Los Naranjos', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'El lote mas grande. Aguacate y platano.', NULL, 'activo')
    RETURNING id INTO v_l3;

    g := ST_GeomFromText('POLYGON((-76.0520 1.8540, -76.05145 1.8540, -76.05145 1.8549, -76.0520 1.8549, -76.0520 1.8540))', 4326);
    INSERT INTO sublotes (lote_id, nombre, geom, "areaM2", "areaHa", centroide, descripcion, estado)
    VALUES (v_l1, 'La Esperanza - Cafe Alto', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'Cafe Castillo sembrado en 2024.', 'activo')
    RETURNING id INTO v_s1;

    g := ST_GeomFromText('POLYGON((-76.05145 1.8540, -76.0509 1.8540, -76.0509 1.8549, -76.05145 1.8549, -76.05145 1.8540))', 4326);
    INSERT INTO sublotes (lote_id, nombre, geom, "areaM2", "areaHa", centroide, descripcion, estado)
    VALUES (v_l1, 'La Esperanza - Mora', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'Mora de Castilla con tutorado en espaldera.', 'activo')
    RETURNING id INTO v_s2;

    g := ST_GeomFromText('POLYGON((-76.0495 1.8525, -76.0491 1.8525, -76.0491 1.8533, -76.0495 1.8533, -76.0495 1.8525))', 4326);
    INSERT INTO sublotes (lote_id, nombre, geom, "areaM2", "areaHa", centroide, descripcion, estado)
    VALUES (v_l2, 'El Mirador - Lulo', g, ROUND(ST_Area(g::geography)::numeric, 2), ROUND((ST_Area(g::geography)/10000)::numeric, 4), ST_Centroid(g),
            'Lulo La Selva bajo semisombra.', 'activo')
    RETURNING id INTO v_s3;

    -- ======================================================================
    -- 2. PRODUCTOS AGRICOLAS
    -- ======================================================================
    INSERT INTO productos_agro (nombre, "unidadBase", descripcion) VALUES
        ('Cafe pergamino seco', 'kg', 'Cafe lavado y secado al 11 % de humedad.') RETURNING id INTO v_p_cafe;
    INSERT INTO productos_agro (nombre, "unidadBase", descripcion) VALUES
        ('Mora de Castilla', 'kg', 'Fruta fresca para pulpa y mesa.') RETURNING id INTO v_p_mora;
    INSERT INTO productos_agro (nombre, "unidadBase", descripcion) VALUES
        ('Lulo La Selva', 'kg', 'Lulo de variedad La Selva, calibre comercial.') RETURNING id INTO v_p_lulo;
    INSERT INTO productos_agro (nombre, "unidadBase", descripcion) VALUES
        ('Aguacate Hass', 'kg', 'Aguacate Hass de exportacion y mercado nacional.') RETURNING id INTO v_p_agua;
    INSERT INTO productos_agro (nombre, "unidadBase", descripcion) VALUES
        ('Platano harton', 'kg', 'Platano harton verde, racimo seleccionado.') RETURNING id INTO v_p_plat;

    -- ======================================================================
    -- 3. CULTIVOS   (estado en minuscula: la pantalla y los reportes lo esperan asi)
    -- ======================================================================
    INSERT INTO cultivos ("nombreCultivo", "tipoCultivo", lote_id, "sub_Lote_id", "fechaSiembra", "fechaFinalizacion", "costoTotal", estado)
    VALUES ('Cafe Castillo', 'Permanente', v_l1, v_s1, '2024-03-15', NULL, 8450000, 'activo') RETURNING id INTO v_c_cafe;

    INSERT INTO cultivos ("nombreCultivo", "tipoCultivo", lote_id, "sub_Lote_id", "fechaSiembra", "fechaFinalizacion", "costoTotal", estado)
    VALUES ('Mora de Castilla', 'Semipermanente', v_l1, v_s2, '2025-01-20', NULL, 3120000, 'activo') RETURNING id INTO v_c_mora;

    INSERT INTO cultivos ("nombreCultivo", "tipoCultivo", lote_id, "sub_Lote_id", "fechaSiembra", "fechaFinalizacion", "costoTotal", estado)
    VALUES ('Lulo La Selva', 'Semipermanente', v_l2, v_s3, '2025-04-10', NULL, 2480000, 'activo') RETURNING id INTO v_c_lulo;

    INSERT INTO cultivos ("nombreCultivo", "tipoCultivo", lote_id, "sub_Lote_id", "fechaSiembra", "fechaFinalizacion", "costoTotal", estado)
    VALUES ('Aguacate Hass', 'Permanente', v_l3, NULL, '2023-09-05', NULL, 11900000, 'activo') RETURNING id INTO v_c_agua;

    INSERT INTO cultivos ("nombreCultivo", "tipoCultivo", lote_id, "sub_Lote_id", "fechaSiembra", "fechaFinalizacion", "costoTotal", estado)
    VALUES ('Platano Harton', 'Transitorio', v_l3, NULL, '2024-11-12', '2026-09-30', 1850000, 'finalizado') RETURNING id INTO v_c_plat;

    -- ======================================================================
    -- 4. COSECHAS (lotes_produccion)
    --    created_at se fija a mano: la grafica de Reportes agrupa por esa
    --    columna, no por una fecha de cosecha aparte.
    --    stock_disponible_kg ya viene descontado de las ventas de abajo.
    -- ======================================================================
    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_cafe, v_c_cafe, v_l1, v_s1, 'A', 450, 150, 7800, 3510000, 14500, '2026-06-18 08:00', '2026-06-18 08:00')
    RETURNING id INTO v_lp1;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_cafe, v_c_cafe, v_l1, v_s1, 'B', 120, 120, 7800, 936000, 11000, '2026-06-18 08:30', '2026-06-18 08:30')
    RETURNING id INTO v_lp2;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_mora, v_c_mora, v_l1, v_s2, 'A', 320, 120, 2900, 928000, 5200, '2026-07-09 07:40', '2026-07-09 07:40')
    RETURNING id INTO v_lp3;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_lulo, v_c_lulo, v_l2, v_s3, 'A', 210, 150, 3400, 714000, 6500, '2026-08-14 09:15', '2026-08-14 09:15')
    RETURNING id INTO v_lp4;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_agua, v_c_agua, v_l3, NULL, 'A', 980, 580, 2100, 2058000, 4800, '2026-09-22 06:50', '2026-09-22 06:50')
    RETURNING id INTO v_lp5;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_plat, v_c_plat, v_l3, NULL, 'A', 600, 600, 1200, 720000, 2400, '2026-05-27 07:20', '2026-05-27 07:20')
    RETURNING id INTO v_lp6;

    INSERT INTO lotes_produccion (producto_agro_id, cultivo_id, lote_id, sub_lote_id, calidad,
            cantidad_kg, stock_disponible_kg, costo_unitario_kg, costo_total, precio_sugerido_kg, created_at, updated_at)
    VALUES (v_p_mora, v_c_mora, v_l1, v_s2, 'A', 180, 180, 2900, 522000, 4300, '2026-10-06 07:30', '2026-10-06 07:30')
    RETURNING id INTO v_lp7;

    -- ======================================================================
    -- 5. CLIENTES
    -- ======================================================================
    INSERT INTO clientes (nombre, identificacion, telefono, email, direccion, notas) VALUES
        ('Cooperativa de Caficultores del Huila', '891180076-1', '3108457721', 'compras@cadefihuila.com',
         'Calle 5 # 4-32, Pitalito', 'Compra cafe pergamino. Pago a 8 dias.') RETURNING id INTO v_cl1;
    INSERT INTO clientes (nombre, identificacion, telefono, email, direccion, notas) VALUES
        ('Central de Abastos Surcolombiana', '900456123-7', '3124478890', 'pedidos@abastossur.co',
         'Km 2 via Neiva, Pitalito', 'Recoge en finca los martes.') RETURNING id INTO v_cl2;
    INSERT INTO clientes (nombre, identificacion, telefono, email, direccion, notas) VALUES
        ('Frutas y Pulpas del Macizo S.A.S.', '901233445-2', '3157741230', 'recepcion@pulpasmacizo.com',
         'Vereda Charguayaco, Pitalito', 'Exige fruta sin magulladuras.') RETURNING id INTO v_cl3;
    INSERT INTO clientes (nombre, identificacion, telefono, email, direccion, notas) VALUES
        ('Maria Fernanda Ortiz', '1083875412', '3212298745', 'mfortiz@gmail.com',
         'Barrio Jardin, Pitalito', 'Compradora local, volumenes pequenos.') RETURNING id INTO v_cl4;

    -- ======================================================================
    -- 6. VENTAS   subtotal - descuento + impuestos = total
    --    estado en minuscula: 'pagada' | 'pendiente' | 'anulada'
    -- ======================================================================
    INSERT INTO ventas (fecha, cliente_id, subtotal, impuestos, descuento, total, estado, usuario_id)
    VALUES ('2026-07-02 10:30', v_cl1, 4350000, 0, 0, 4350000, 'pagada', v_usuario) RETURNING id INTO v_v1;

    INSERT INTO ventas (fecha, cliente_id, subtotal, impuestos, descuento, total, estado, usuario_id)
    VALUES ('2026-07-28 15:10', v_cl3, 1040000, 0, 40000, 1000000, 'pagada', v_usuario) RETURNING id INTO v_v2;

    INSERT INTO ventas (fecha, cliente_id, subtotal, impuestos, descuento, total, estado, usuario_id)
    VALUES ('2026-09-30 11:05', v_cl2, 1920000, 0, 0, 1920000, 'pendiente', v_usuario) RETURNING id INTO v_v3;

    INSERT INTO ventas (fecha, cliente_id, subtotal, impuestos, descuento, total, estado, usuario_id)
    VALUES ('2026-10-15 16:40', v_cl4, 390000, 0, 0, 390000, 'pendiente', v_usuario) RETURNING id INTO v_v4;

    INSERT INTO ventas (fecha, cliente_id, subtotal, impuestos, descuento, total, estado, usuario_id,
            anulada_por_usuario_id, fecha_anulacion)
    VALUES ('2026-08-20 09:00', v_cl2, 600000, 0, 0, 600000, 'anulada', v_usuario,
            v_usuario, '2026-08-22 08:15') RETURNING id INTO v_v5;

    -- Detalles. El platano de la venta anulada NO esta descontado del stock:
    -- asi queda igual que si se hubiera anulado desde la pantalla.
    INSERT INTO ventas_detalles ("ventaId", "productoAgroId", "loteProduccionId", "cultivoId",
            "cantidadKg", "precioUnitarioKg", "precioTotal", "costoUnitarioKg", "costoTotal") VALUES
        (v_v1, v_p_cafe, v_lp1, v_c_cafe, 300, 14500, 4350000, 7800, 2340000),
        (v_v2, v_p_mora, v_lp3, v_c_mora, 200,  5200, 1040000, 2900,  580000),
        (v_v3, v_p_agua, v_lp5, v_c_agua, 400,  4800, 1920000, 2100,  840000),
        (v_v4, v_p_lulo, v_lp4, v_c_lulo,  60,  6500,  390000, 3400,  204000),
        (v_v5, v_p_plat, v_lp6, v_c_plat, 250,  2400,  600000, 1200,  300000);

    -- TypeORM creo una segunda columna 'producto_agro_id' por la relacion
    -- ManyToOne. Si existe, la rellenamos para que las consultas con
    -- relations: ['productoAgro'] tambien devuelvan el producto.
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'ventas_detalles' AND column_name = 'producto_agro_id') THEN
        EXECUTE 'UPDATE ventas_detalles SET producto_agro_id = "productoAgroId" WHERE producto_agro_id IS NULL';
    END IF;

    -- ======================================================================
    -- 7. FINANZAS
    --    Reportes suma como egreso todo lo que tenga 'egres' o 'gasto' en
    --    el tipo. Los ingresos los saca de ventas, no de aqui.
    -- ======================================================================
    INSERT INTO finanzas (tipo, monto, descripcion, fecha, "ventaId") VALUES
        ('egreso', 1250000, 'Compra de fertilizante DAP - 10 bultos',      '2026-05-14 09:00', NULL),
        ('egreso',  780000, 'Jornales de recoleccion de cafe',             '2026-06-20 17:00', NULL),
        ('egreso',  420000, 'Fungicida para antracnosis en mora',          '2026-07-11 10:20', NULL),
        ('egreso',  950000, 'Jornales de poda y limpieza',                 '2026-08-08 17:00', NULL),
        ('egreso',  310000, 'Combustible y transporte a Pitalito',         '2026-09-05 08:30', NULL),
        ('egreso', 1100000, 'Jornales de cosecha de aguacate',             '2026-09-24 17:00', NULL),
        ('egreso',  265000, 'Insumos varios para el sistema de riego',     '2026-10-09 11:00', NULL),
        ('ingreso', 4350000, 'Pago Cooperativa de Caficultores',           '2026-07-10 14:00', v_v1),
        ('ingreso', 1000000, 'Pago Frutas y Pulpas del Macizo',            '2026-08-05 09:30', v_v2);

    -- ======================================================================
    -- 8. INVENTARIO
    --    Un insumo queda bajo el minimo y otro en cero: son las dos
    --    alertas de stock que muestra la pantalla de Alertas.
    --    La regla del dominio es stock_uso <= stock_minimo.
    -- ======================================================================
    INSERT INTO almacenes (nombre, descripcion, ubicacion) VALUES
        ('Bodega principal', 'Bodega techada junto a la casa de la finca.', 'Sede Pitalito') RETURNING id INTO v_alm1;
    INSERT INTO almacenes (nombre, descripcion, ubicacion) VALUES
        ('Bodega de campo', 'Caseta de herramienta menor.', 'Lote Los Naranjos') RETURNING id INTO v_alm2;

    INSERT INTO proveedores (nombre) VALUES ('Agroinsumos del Huila') RETURNING id INTO v_prov1;
    INSERT INTO proveedores (nombre) VALUES ('Distriagro Pitalito') RETURNING id INTO v_prov2;

    INSERT INTO categorias (nombre, descripcion, tipo_insumo) VALUES
        ('Fertilizantes', 'Edaficos y foliares.', 'consumible') RETURNING id INTO v_cat_fert;
    INSERT INTO categorias (nombre, descripcion, tipo_insumo) VALUES
        ('Fungicidas', 'Control de enfermedades.', 'consumible') RETURNING id INTO v_cat_fung;
    INSERT INTO categorias (nombre, descripcion, tipo_insumo) VALUES
        ('Herramienta menor', 'Equipos de uso manual.', 'herramienta') RETURNING id INTO v_cat_herr;

    INSERT INTO insumos (nombre, descripcion, presentacion_tipo, presentacion_cantidad, presentacion_unidad,
            unidad_uso, factor_conversion_uso, stock_presentacion, stock_uso, stock_reservado, stock_minimo,
            precio_unitario_presentacion, precio_unitario_uso, almacen_id, proveedor_id, categoria_id,
            tipo_insumo, estado, creado_por_usuario_id)
    VALUES ('Fertilizante DAP', 'Fosfato diamonico 18-46-0.', 'bulto', 50, 'kg',
            'kg', 50, 8, 400, 0, 100,
            145000, 2900, v_alm1, v_prov1, v_cat_fert, 'consumible', 'activo', v_usuario);

    -- Bajo el minimo pero todavia queda algo  ->  alerta media
    INSERT INTO insumos (nombre, descripcion, presentacion_tipo, presentacion_cantidad, presentacion_unidad,
            unidad_uso, factor_conversion_uso, stock_presentacion, stock_uso, stock_reservado, stock_minimo,
            precio_unitario_presentacion, precio_unitario_uso, almacen_id, proveedor_id, categoria_id,
            tipo_insumo, estado, creado_por_usuario_id)
    VALUES ('Fungicida Mancozeb', 'Mancozeb 80 % WP, control de roya y antracnosis.', 'frasco', 1000, 'ml',
            'ml', 1000, 2, 2000, 0, 2500,
            38000, 38, v_alm1, v_prov2, v_cat_fung, 'consumible', 'activo', v_usuario);

    -- Agotado  ->  alerta alta
    INSERT INTO insumos (nombre, descripcion, presentacion_tipo, presentacion_cantidad, presentacion_unidad,
            unidad_uso, factor_conversion_uso, stock_presentacion, stock_uso, stock_reservado, stock_minimo,
            precio_unitario_presentacion, precio_unitario_uso, almacen_id, proveedor_id, categoria_id,
            tipo_insumo, estado, creado_por_usuario_id)
    VALUES ('Abono organico compostado', 'Compost de pulpa de cafe.', 'bulto', 40, 'kg',
            'kg', 40, 0, 0, 0, 80,
            32000, 800, v_alm1, v_prov1, v_cat_fert, 'consumible', 'agotado', v_usuario);

    INSERT INTO insumos (nombre, descripcion, presentacion_tipo, presentacion_cantidad, presentacion_unidad,
            unidad_uso, factor_conversion_uso, stock_presentacion, stock_uso, stock_reservado, stock_minimo,
            precio_unitario_presentacion, precio_unitario_uso, almacen_id, proveedor_id, categoria_id,
            tipo_insumo, estado, costo_adquisicion, valor_residual, vida_util_horas, horas_usadas,
            depreciacion_acumulada, creado_por_usuario_id)
    VALUES ('Guadana Stihl FS 250', 'Guadana de 2 tiempos para limpieza de calles.', 'unidad', 1, 'unidad',
            'unidad', 1, 2, 2, 0, 1,
            2850000, 2850000, v_alm2, v_prov2, v_cat_herr, 'herramienta', 'activo',
            2850000, 300000, 3000, 420, 357000, v_usuario);

    INSERT INTO insumos (nombre, descripcion, presentacion_tipo, presentacion_cantidad, presentacion_unidad,
            unidad_uso, factor_conversion_uso, stock_presentacion, stock_uso, stock_reservado, stock_minimo,
            precio_unitario_presentacion, precio_unitario_uso, almacen_id, proveedor_id, categoria_id,
            tipo_insumo, estado, costo_adquisicion, vida_util_horas, horas_usadas, creado_por_usuario_id)
    VALUES ('Tijera de podar Felco 2', 'Tijera de poda manual.', 'unidad', 1, 'unidad',
            'unidad', 1, 6, 6, 0, 2,
            185000, 185000, v_alm2, v_prov2, v_cat_herr, 'herramienta', 'activo',
            185000, 1200, 180, v_usuario);

    -- ======================================================================
    -- 9. SENSORES Y ALERTAS IoT
    --    La severidad la calcula el frontend: alta si el valor se desvia
    --    mas del 20 % del umbral. Aqui queda 1 alta y 2 medias.
    -- ======================================================================
    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos) VALUES
        ('Temperatura ambiente', 'C', 1, 'Termometro digital de ambiente.', 15) RETURNING id INTO v_ts_temp;
    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos) VALUES
        ('Humedad del suelo', '%', 0, 'Sonda capacitiva de humedad.', 15) RETURNING id INTO v_ts_hum;
    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos) VALUES
        ('pH del suelo', 'pH', 1, 'Sonda de pH para suelo.', 60) RETURNING id INTO v_ts_ph;
    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos) VALUES
        ('Luminosidad', 'lux', 0, 'Fotorresistencia calibrada.', 30) RETURNING id INTO v_ts_luz;

    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, endpoint_url, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, ultimo_valor, ultima_medicion, ultima_vista_en,
            cultivo_id, creado_por_usuario_id, lote_id, sub_lote_id)
    VALUES ('Temperatura - La Esperanza', v_ts_temp, 'HTTP', 'http://192.168.1.40/temp', 14, 28, true,
            'conectado', '31.4', NOW() - INTERVAL '12 minutes', NOW() - INTERVAL '12 minutes',
            v_c_cafe, v_usuario, v_l1, v_s1) RETURNING id INTO v_sn1;

    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, mqtt_topic, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, ultimo_valor, ultima_medicion, ultima_vista_en,
            cultivo_id, creado_por_usuario_id, lote_id, sub_lote_id)
    VALUES ('Humedad suelo - La Esperanza', v_ts_hum, 'MQTT', 'agrosoft/esperanza/humedad', 35, 75, true,
            'conectado', '24', NOW() - INTERVAL '8 minutes', NOW() - INTERVAL '8 minutes',
            v_c_cafe, v_usuario, v_l1, v_s1) RETURNING id INTO v_sn2;

    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, endpoint_url, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, ultimo_valor, ultima_medicion, ultima_vista_en,
            cultivo_id, creado_por_usuario_id, lote_id, sub_lote_id)
    VALUES ('pH suelo - El Mirador', v_ts_ph, 'HTTP', 'http://192.168.1.41/ph', 5.5, 6.8, true,
            'conectado', '4.9', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '35 minutes',
            v_c_lulo, v_usuario, v_l2, v_s3) RETURNING id INTO v_sn3;

    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, mqtt_topic, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, ultimo_valor, ultima_medicion, ultima_vista_en,
            cultivo_id, creado_por_usuario_id, lote_id, sub_lote_id)
    VALUES ('Luminosidad - Los Naranjos', v_ts_luz, 'MQTT', 'agrosoft/naranjos/luz', 8000, 45000, true,
            'conectado', '38500', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes',
            v_c_agua, v_usuario, v_l3, NULL) RETURNING id INTO v_sn4;

    INSERT INTO sensor_alertas (sensor_id, valor, umbral, tipo, fecha_alerta, lote_id, sub_lote_id) VALUES
        (v_sn2, 24,   35,  'min', NOW() - INTERVAL '8 minutes',  v_l1, v_s1),   -- desviacion 31 %  -> alta
        (v_sn1, 31.4, 28,  'max', NOW() - INTERVAL '12 minutes', v_l1, v_s1),   -- desviacion 12 %  -> media
        (v_sn3, 4.9,  5.5, 'min', NOW() - INTERVAL '35 minutes', v_l2, v_s3);   -- desviacion 11 %  -> media

    -- ======================================================================
    -- 10. ACTIVIDADES
    --     El estado va con mayuscula inicial: el hook de Alertas filtra por
    --     'Pendiente' y 'En_progreso', y la entidad usa ese mismo formato.
    --     Las fechas son relativas a hoy para que las alertas suenen
    --     siempre, sin importar cuando corras el script.
    -- ======================================================================
    INSERT INTO actividades (nombre, tipo, subtipo, lote_id, sub_lote_id, cultivo_id, fecha,
            horas_actividad, precio_hora_actividad, descripcion, creado_por_usuario_id,
            cantidad_plantas, producto_agro_id, estado, "costoManoObra", "kgRecolectados") VALUES

        -- Vencida hace 5 dias  ->  alerta alta
        ('Fertilizacion de cafe - primera aplicacion', 'Fertilizacion', 'Edafica', v_l1, v_s1, v_c_cafe,
         CURRENT_DATE - 5, 6, 8000, 'Aplicar DAP al pie de cada arbol, 120 g por planta.',
         v_usuario, 2800, NULL, 'Pendiente', NULL, NULL),

        -- Vence hoy  ->  alerta media
        ('Control de arvenses en mora', 'Labor cultural', 'Desyerba', v_l1, v_s2, v_c_mora,
         CURRENT_DATE, 4, 8000, 'Guadanear calles y plateo manual alrededor de la espaldera.',
         v_usuario, NULL, NULL, 'En_progreso', NULL, NULL),

        -- Vence en 2 dias  ->  alerta baja
        ('Riego programado de lulo', 'Riego', 'Goteo', v_l2, v_s3, v_c_lulo,
         CURRENT_DATE + 2, 3, 8000, 'Revisar goteros tapados antes de abrir la valvula.',
         v_usuario, NULL, NULL, 'Pendiente', NULL, NULL),

        -- Lejos: no genera alerta
        ('Cosecha de aguacate - pase 2', 'Cosecha', NULL, v_l3, NULL, v_c_agua,
         CURRENT_DATE + 19, 10, 9000, 'Recolectar solo fruta con 23 % de materia seca.',
         v_usuario, NULL, v_p_agua, 'Pendiente', NULL, NULL),

        -- Ya completadas: historial
        ('Poda sanitaria de cafe', 'Poda', 'Sanitaria', v_l1, v_s1, v_c_cafe,
         '2026-09-18', 8, 8000, 'Retirar ramas improductivas y material enfermo.',
         v_usuario, NULL, NULL, 'Completada', 64000, NULL),

        ('Cosecha de mora - pase 3', 'Cosecha', NULL, v_l1, v_s2, v_c_mora,
         '2026-10-06', 5, 8000, 'Recoleccion en grado 4 de madurez.',
         v_usuario, NULL, v_p_mora, 'Completada', 40000, 180);

    -- ======================================================================
    -- 11. INCIDENCIAS Y TRATAMIENTOS
    --     estado incidencia: open | in_treatment | resolved
    --     severidad:         low | medium | high
    --     estado tratamiento: scheduled | applied
    -- ======================================================================
    INSERT INTO incidencias (titulo, tipo, severidad, estado, cultivo_id, fecha, descripcion)
    VALUES ('Broca del cafe en el sublote alto', 'Plaga', 'medium', 'in_treatment', v_c_cafe,
            '2026-09-28', 'Se encontro 4,2 % de infestacion en muestreo de 30 arboles.')
    RETURNING id INTO v_inc1;

    INSERT INTO incidencias (titulo, tipo, severidad, estado, cultivo_id, fecha, descripcion)
    VALUES ('Antracnosis en mora', 'Enfermedad', 'high', 'open', v_c_mora,
            CURRENT_DATE - 8, 'Lesiones hundidas en frutos verdes, avanza con las lluvias.');

    INSERT INTO incidencias (titulo, tipo, severidad, estado, cultivo_id, fecha, descripcion)
    VALUES ('Hormiga arriera en aguacate', 'Plaga', 'low', 'resolved', v_c_agua,
            '2026-08-12', 'Dos nidos activos en el borde norte del lote.')
    RETURNING id INTO v_inc3;

    INSERT INTO tratamientos (incidencia_id, producto, dosis, fecha, costo, notas, estado) VALUES
        (v_inc1, 'Beauveria bassiana', '2 g/L', '2026-10-02', 185000,
         'Aplicacion dirigida al fruto. Repetir en 15 dias.', 'applied'),
        (v_inc1, 'Trampas con alcohol-metanol', '1 trampa por 10 arboles', CURRENT_DATE + 4, 45000,
         'Instalar antes del pico de vuelo.', 'scheduled'),
        (v_inc3, 'Cebo granulado para arriera', '15 g por boca de nido', '2026-08-15', 62000,
         'Nidos controlados. Se cierra la incidencia.', 'applied');

    -- ======================================================================
    -- 12. WIKI EPA
    --     tipo_epa va en MAYUSCULA: la pantalla resuelve el icono y el
    --     color con 'PLAGA' | 'ENFERMEDAD' | 'ARVENSE'.
    -- ======================================================================
    INSERT INTO wiki_tipo_epa (nombre, descripcion, tipo_epa_enum) VALUES
        ('Plaga', 'Insectos, acaros y otros animales que danan el cultivo.', 'PLAGA'),
        ('Enfermedad', 'Hongos, bacterias y virus que afectan la planta.', 'ENFERMEDAD'),
        ('Arvense', 'Plantas que compiten con el cultivo por agua y nutrientes.', 'ARVENSE');

    INSERT INTO tipos_cultivos_wiki (nombre, descripcion) VALUES
        ('Cafe', 'Coffea arabica. Cultivo principal de la zona.'),
        ('Mora', 'Rubus glaucus, mora de Castilla.'),
        ('Lulo', 'Solanum quitoense.'),
        ('Aguacate', 'Persea americana, variedad Hass.'),
        ('Platano', 'Musa paradisiaca, variedad harton.');

    INSERT INTO epas (nombre, tipo_epa, descripcion, sintomas, manejo_y_control,
            meses_probables, temporadas, notas_estacionalidad, etiquetas, creado_por_usuario_id) VALUES

        ('Broca del cafe', 'PLAGA',
         'Hypothenemus hampei. Es la plaga de mayor impacto economico en el cafe colombiano. La hembra perfora el fruto y pone los huevos dentro del grano.',
         'Orificio de 1 mm en la corona del fruto, polvillo claro en la base, granos perforados y de bajo peso al beneficiar.',
         'Re-re cada ocho dias en epoca seca para no dejar fruto en el arbol. Trampas con alcohol-metanol en los bordes. Beauveria bassiana cuando la infestacion pasa del 2 %.',
         ARRAY[3,4,5,9,10,11], ARRAY['Lluvias','Cosecha'],
         'El pico coincide con los dos picos de cosecha del Huila: marzo-mayo y septiembre-noviembre.',
         ARRAY['Cafe','Fruto','Hypothenemus hampei'], v_usuario),

        ('Roya del cafeto', 'ENFERMEDAD',
         'Hemileia vastatrix. Hongo que ataca la hoja y provoca defoliacion severa, con perdidas de hasta el 30 % de la produccion del ano siguiente.',
         'Manchas amarillas en el enves de la hoja con polvo naranja. Caida temprana de hojas y ramas desnudas.',
         'Sembrar variedades resistentes como Castillo o Cenicafe 1. Fertilizacion balanceada. Fungicida sistemico si el porcentaje de hojas enfermas pasa del 5 %.',
         ARRAY[4,5,6,10,11], ARRAY['Lluvias'],
         'Avanza mas rapido con lluvia continua y sombra excesiva.',
         ARRAY['Cafe','Hoja','Hemileia vastatrix'], v_usuario),

        ('Antracnosis de la mora', 'ENFERMEDAD',
         'Colletotrichum spp. Afecta flores, frutos y ramas de la mora de Castilla; es la principal causa de perdida en poscosecha.',
         'Lesiones hundidas de color oscuro en el fruto, momificacion y secamiento de las puntas de las ramas.',
         'Poda de ventilacion y retiro de fruto momificado. Evitar riego por aspersion. Mancozeb o productos a base de cobre en rotacion.',
         ARRAY[1,2,10,11,12], ARRAY['Lluvias'],
         'Se dispara en periodos de alta humedad relativa, sobre todo al final del ano.',
         ARRAY['Mora','Fruto','Colletotrichum'], v_usuario),

        ('Hormiga arriera', 'PLAGA',
         'Atta spp. Corta hojas y brotes tiernos para cultivar su hongo. Un nido grande puede defoliar arboles jovenes en pocas noches.',
         'Hojas cortadas en forma de media luna, senderos limpios en el suelo y monticulos de tierra suelta sobre el nido.',
         'Ubicar la boca del nido y aplicar cebo granulado. No remover el monticulo antes de aplicar. Revisar a los 15 dias.',
         ARRAY[6,7,8], ARRAY['Verano'],
         'Mas activa en epoca seca, cuando sale a forrajear de noche.',
         ARRAY['Aguacate','Platano','Atta'], v_usuario),

        ('Coquito', 'ARVENSE',
         'Cyperus rotundus. Arvense de hoja angosta muy agresiva, se reproduce por tuberculos y compite fuerte por nitrogeno.',
         'Macollas de hojas acanaladas y brillantes, inflorescencia pardo-rojiza. Cadenas de tuberculos al arrancar la planta.',
         'Manejo integrado: cobertura noble, plateo manual y solo en ultimo caso herbicida sistemico. Arrancarlo sin sacar el tuberculo lo multiplica.',
         ARRAY[1,2,3,4,5,6,7,8,9,10,11,12], ARRAY['Todo el ano'],
         'Presente todo el ano; se nota mas cuando el cultivo esta recien sembrado.',
         ARRAY['Arvense','Suelo','Cyperus rotundus'], v_usuario);

    RAISE NOTICE 'Seed completo.';
END
$seed$;

-- ============================================================================
--  COMPROBACION
--  Corre esto despues del seed. Si algo no cuadra, se ve aqui.
-- ============================================================================

-- Resumen por tabla
SELECT 'lotes'            AS tabla, COUNT(*) AS filas FROM lotes
UNION ALL SELECT 'sublotes',          COUNT(*) FROM sublotes
UNION ALL SELECT 'productos_agro',    COUNT(*) FROM productos_agro
UNION ALL SELECT 'cultivos',          COUNT(*) FROM cultivos
UNION ALL SELECT 'lotes_produccion',  COUNT(*) FROM lotes_produccion
UNION ALL SELECT 'clientes',          COUNT(*) FROM clientes
UNION ALL SELECT 'ventas',            COUNT(*) FROM ventas
UNION ALL SELECT 'ventas_detalles',   COUNT(*) FROM ventas_detalles
UNION ALL SELECT 'finanzas',          COUNT(*) FROM finanzas
UNION ALL SELECT 'insumos',           COUNT(*) FROM insumos
UNION ALL SELECT 'sensores',          COUNT(*) FROM sensores
UNION ALL SELECT 'sensor_alertas',    COUNT(*) FROM sensor_alertas
UNION ALL SELECT 'actividades',       COUNT(*) FROM actividades
UNION ALL SELECT 'incidencias',       COUNT(*) FROM incidencias
UNION ALL SELECT 'tratamientos',      COUNT(*) FROM tratamientos
UNION ALL SELECT 'epas',              COUNT(*) FROM epas
ORDER BY tabla;

-- Los numeros que debe mostrar Reportes
SELECT
    (SELECT SUM(cantidad_kg) FROM lotes_produccion WHERE deleted_at IS NULL)                      AS produccion_kg,
    (SELECT COUNT(*) FROM cultivos WHERE deleted_at IS NULL AND LOWER(estado) = 'activo')         AS unidades_activas,
    (SELECT SUM(total) FROM ventas WHERE deleted_at IS NULL AND LOWER(estado) <> 'anulada')       AS ingresos,
    (SELECT SUM(monto) FROM finanzas WHERE deleted_at IS NULL AND LOWER(tipo) LIKE '%egres%')     AS egresos;
-- Esperado: 2860 | 4 | 7660000 | 5075000     (rentabilidad 34 %)

-- Cada venta: el total tiene que ser subtotal - descuento + impuestos,
-- y tiene que coincidir con la suma de sus detalles.
SELECT v.id, v.estado, v.subtotal, v.descuento, v.impuestos, v.total,
       (v.subtotal - v.descuento + v.impuestos) AS total_calculado,
       SUM(d."precioTotal")                     AS suma_detalles,
       CASE WHEN v.total = v.subtotal - v.descuento + v.impuestos THEN 'ok' ELSE 'REVISAR' END AS cuadra
FROM ventas v
JOIN ventas_detalles d ON d."ventaId" = v.id
GROUP BY v.id, v.estado, v.subtotal, v.descuento, v.impuestos, v.total
ORDER BY v.id;

-- Stock de cada cosecha contra lo que se vendio.
-- La venta anulada no debe descontar: el platano queda completo.
SELECT lp.id, p.nombre AS producto, lp.calidad, lp.cantidad_kg, lp.stock_disponible_kg,
       COALESCE(SUM(CASE WHEN LOWER(v.estado) <> 'anulada' THEN d."cantidadKg" END), 0) AS vendido_kg,
       CASE WHEN lp.stock_disponible_kg
                 = lp.cantidad_kg - COALESCE(SUM(CASE WHEN LOWER(v.estado) <> 'anulada' THEN d."cantidadKg" END), 0)
            THEN 'ok' ELSE 'REVISAR' END AS cuadra
FROM lotes_produccion lp
JOIN productos_agro p ON p.id = lp.producto_agro_id
LEFT JOIN ventas_detalles d ON d."loteProduccionId" = lp.id AND d.deleted_at IS NULL
LEFT JOIN ventas v          ON v.id = d."ventaId"
GROUP BY lp.id, p.nombre, lp.calidad, lp.cantidad_kg, lp.stock_disponible_kg
ORDER BY lp.id;

-- Las alertas que deberia mostrar la pantalla
SELECT 'sensor' AS origen, COUNT(*) AS alertas FROM sensor_alertas WHERE eliminado_en IS NULL
UNION ALL
SELECT 'stock', COUNT(*) FROM insumos WHERE deleted_at IS NULL AND stock_uso <= stock_minimo
UNION ALL
SELECT 'tarea', COUNT(*) FROM actividades
 WHERE deleted_at IS NULL AND estado IN ('Pendiente','En_progreso') AND fecha <= CURRENT_DATE + 3;
-- Esperado: 3 | 2 | 3
