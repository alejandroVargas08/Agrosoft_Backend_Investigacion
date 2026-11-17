-- ============================================================================
--  AgroSoft - Estaciones IoT con lecturas
--  Proyecto formativo SENA - Juan David Perdomo Valencia
-- ============================================================================
--  QUE HACE
--    Deja tres estaciones completas, una por lote, con las medidas del diseño
--    (temperatura, humedad, indice UV y luminosidad, mas pH en El Mirador) y
--    siete dias de lecturas cada 30 minutos, con curva de dia y noche.
--
--    Las tres estaciones quedan en un estado distinto a proposito, para poder
--    ver las tres tarjetas del diseño:
--      Lote La Esperanza  -> Conectada    (todo dentro de rango)
--      Lote Los Naranjos  -> Con alerta   (UV 9 y 88 klx, fuera de rango)
--      Lote El Mirador    -> Desconectada (ningun sensor reporta)
--
--  QUE NO TOCA
--    Nada fuera de IoT. Usuarios, lotes, cultivos e inventario quedan igual.
--
--  COMO SE CORRE
--    pgAdmin -> base Agrosoft_DB -> Query Tool -> abrir este archivo -> F5.
--    Se puede correr las veces que haga falta: empieza borrando lo suyo.
--
--  REQUISITO
--    Los lotes del seed 02 tienen que existir. Si no, el script avisa y sale
--    sin tocar nada.
-- ============================================================================

BEGIN;

DO $$
DECLARE
    v_usuario   int;
    v_l_esp     int;  -- Lote La Esperanza
    v_l_mir     int;  -- Lote El Mirador
    v_l_nar     int;  -- Lote Los Naranjos

    v_ts_temp   int;
    v_ts_hum    int;
    v_ts_uv     int;
    v_ts_luz    int;
    v_ts_ph     int;
BEGIN
    SELECT id INTO v_usuario FROM usuarios ORDER BY id LIMIT 1;
    IF v_usuario IS NULL THEN
        RAISE EXCEPTION 'No hay usuarios en la base. Corre primero el seed 02.';
    END IF;

    SELECT id INTO v_l_esp FROM lotes WHERE nombre = 'Lote La Esperanza';
    SELECT id INTO v_l_mir FROM lotes WHERE nombre = 'Lote El Mirador';
    SELECT id INTO v_l_nar FROM lotes WHERE nombre = 'Lote Los Naranjos';

    IF v_l_esp IS NULL OR v_l_mir IS NULL OR v_l_nar IS NULL THEN
        RAISE EXCEPTION 'Faltan los lotes del seed 02 (La Esperanza, El Mirador, Los Naranjos).';
    END IF;

    -- ------------------------------------------------------------------
    -- Se borra lo de IoT para poder correr esto cuantas veces haga falta
    -- ------------------------------------------------------------------
    DELETE FROM sensor_lecturas;
    DELETE FROM sensor_alertas;
    DELETE FROM sensores;
    DELETE FROM tipos_sensores;

    -- Se reinician los contadores de id. Se pregunta por el nombre real de la
    -- secuencia en vez de suponerlo, que cambia segun como se creo la tabla.
    PERFORM setval(pg_get_serial_sequence('sensor_lecturas', 'id'), 1, false);
    PERFORM setval(pg_get_serial_sequence('sensores',        'id'), 1, false);
    PERFORM setval(pg_get_serial_sequence('tipos_sensores',  'id'), 1, false);

    -- ------------------------------------------------------------------
    -- Tipos de sensor. El frontend deduce la medida por este nombre:
    -- "temp" -> temperatura, "hum" -> humedad, "ph" -> pH,
    -- "uv" -> indice UV, "lumin"/"lux"/"luz" -> luminosidad.
    -- ------------------------------------------------------------------
    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos)
    VALUES ('Temperatura ambiente', 'C', 1, 'DHT22 - temperatura del aire.', 15)
    RETURNING id INTO v_ts_temp;

    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos)
    VALUES ('Humedad relativa', '%', 0, 'DHT22 - humedad relativa del aire.', 15)
    RETURNING id INTO v_ts_hum;

    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos)
    VALUES ('Indice UV', '', 0, 'UVM-30A - radiacion ultravioleta, escala 0 a 11+.', 15)
    RETURNING id INTO v_ts_uv;

    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos)
    VALUES ('Luminosidad', 'lx', 0, 'Fotorresistor / BH1750 - luz incidente.', 30)
    RETURNING id INTO v_ts_luz;

    INSERT INTO tipos_sensores (nombre, unidad, decimales, descripcion, ttl_minutos)
    VALUES ('pH del suelo', 'pH', 1, 'Sonda de pH para suelo.', 60)
    RETURNING id INTO v_ts_ph;

    -- ------------------------------------------------------------------
    -- Estacion 1: Lote La Esperanza. Todo dentro de rango -> Conectada.
    -- ------------------------------------------------------------------
    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, mqtt_topic, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, creado_por_usuario_id, lote_id)
    VALUES
        ('Temperatura - La Esperanza', v_ts_temp, 'MQTT', 'agrosoft/esperanza/temp',  15,    32,    true, 'conectado', v_usuario, v_l_esp),
        ('Humedad - La Esperanza',     v_ts_hum,  'MQTT', 'agrosoft/esperanza/hum',   40,    85,    true, 'conectado', v_usuario, v_l_esp),
        ('UV - La Esperanza',          v_ts_uv,   'MQTT', 'agrosoft/esperanza/uv',     0,    11,    true, 'conectado', v_usuario, v_l_esp),
        ('Luminosidad - La Esperanza', v_ts_luz,  'MQTT', 'agrosoft/esperanza/luz', 10000, 80000,   true, 'conectado', v_usuario, v_l_esp);

    -- ------------------------------------------------------------------
    -- Estacion 2: Lote Los Naranjos. UV y luz por encima -> Con alerta.
    -- Son los numeros de la pantalla del diseño: 34.2 C, 38 %, UV 9, 88 klx.
    -- ------------------------------------------------------------------
    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, mqtt_topic, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, creado_por_usuario_id, lote_id)
    VALUES
        ('Temperatura - Los Naranjos', v_ts_temp, 'MQTT', 'agrosoft/naranjos/temp',  15,    32,    true, 'conectado', v_usuario, v_l_nar),
        ('Humedad - Los Naranjos',     v_ts_hum,  'MQTT', 'agrosoft/naranjos/hum',   40,    85,    true, 'conectado', v_usuario, v_l_nar),
        ('UV - Los Naranjos',          v_ts_uv,   'MQTT', 'agrosoft/naranjos/uv',     0,     8,    true, 'conectado', v_usuario, v_l_nar),
        ('Luminosidad - Los Naranjos', v_ts_luz,  'MQTT', 'agrosoft/naranjos/luz', 10000, 80000,   true, 'conectado', v_usuario, v_l_nar);

    -- ------------------------------------------------------------------
    -- Estacion 3: Lote El Mirador. Ninguno reporta -> Desconectada.
    -- Igual se le cargan lecturas, para que al entrar al detalle la grafica
    -- tenga historia aunque la estacion este caida.
    -- ------------------------------------------------------------------
    INSERT INTO sensores (nombre_sensor, tipo_sensor_id, protocolo, endpoint_url, valor_minimo_sensor,
            valor_maximo_sensor, activo, estado_conexion, creado_por_usuario_id, lote_id)
    VALUES
        ('Temperatura - El Mirador', v_ts_temp, 'HTTP', 'http://192.168.1.40/temp', 15,  32,  true, 'desconectado', v_usuario, v_l_mir),
        ('Humedad - El Mirador',     v_ts_hum,  'HTTP', 'http://192.168.1.40/hum',  40,  85,  true, 'desconectado', v_usuario, v_l_mir),
        ('pH suelo - El Mirador',    v_ts_ph,   'HTTP', 'http://192.168.1.41/ph',  5.5, 6.8,  true, 'desconectado', v_usuario, v_l_mir);
END $$;

-- ============================================================================
--  LECTURAS: siete dias, cada 30 minutos, con curva de dia y noche.
--
--  curva_sol  va de 0 a 1 entre las 6:00 y las 19:00, con el pico a mediodia.
--             Sirve para UV y luminosidad, que de noche quedan en 0.
--  curva_dia  es mas ancha (5:00 a 20:00) y mueve temperatura y humedad, que
--             nunca llegan a cero.
-- ============================================================================
INSERT INTO sensor_lecturas (sensor_id, valor, fecha_lectura, unidad)
SELECT
    s.id,
    ROUND(
        CASE
            -- 18 C de madrugada, hasta ~34 C al mediodia
            WHEN t.nombre LIKE 'Temperatura%' THEN 18 + 16 * c.curva_dia + (random() - 0.5)
            -- al reves que la temperatura: 78 % de noche, ~38 % al mediodia
            WHEN t.nombre LIKE 'Humedad%'     THEN 78 - 40 * c.curva_dia + (random() - 0.5) * 2
            -- UV y luz: el ruido solo se aplica de dia, para que de noche
            -- queden en cero pelado y no oscilando alrededor de cero.
            WHEN t.nombre LIKE 'Indice UV%'   THEN 9 * c.curva_sol
            WHEN t.nombre LIKE 'Luminosidad%' THEN
                CASE WHEN c.curva_sol > 0 THEN 91000 * c.curva_sol + (random() - 0.5) * 1500 ELSE 0 END
            ELSE 4.9 + (random() - 0.5) * 0.2                     -- pH, casi plano
        END::numeric,
        CASE WHEN t.nombre LIKE 'Temperatura%' OR t.nombre LIKE 'pH%' THEN 1 ELSE 0 END
    )::text,
    c.momento,
    COALESCE(NULLIF(t.unidad, ''), '')
FROM sensores s
JOIN tipos_sensores t ON t.id = s.tipo_sensor_id
CROSS JOIN LATERAL (
    SELECT
        momento,
        GREATEST(0, sin(pi() * (EXTRACT(hour FROM momento) + EXTRACT(minute FROM momento) / 60.0 - 6) / 13)) AS curva_sol,
        GREATEST(0, sin(pi() * (EXTRACT(hour FROM momento) + EXTRACT(minute FROM momento) / 60.0 - 5) / 15)) AS curva_dia
    FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '30 minutes') AS momento
) c;

-- Que las lecturas no puedan quedar en negativo por el ruido aleatorio
UPDATE sensor_lecturas SET valor = '0' WHERE valor::numeric < 0;

-- ============================================================================
--  El sensor guarda aparte su ultima lectura: es lo que la tarjeta muestra.
--  Las estaciones caidas no reportan, asi que se les deja en nulo.
-- ============================================================================
UPDATE sensores s
SET ultimo_valor    = u.valor,
    ultima_medicion = u.fecha_lectura,
    ultima_vista_en = u.fecha_lectura
FROM (
    SELECT DISTINCT ON (sensor_id) sensor_id, valor, fecha_lectura
    FROM sensor_lecturas
    ORDER BY sensor_id, fecha_lectura DESC
) u
WHERE u.sensor_id = s.id AND s.estado_conexion = 'conectado';

UPDATE sensores
SET ultimo_valor = NULL, ultima_medicion = NULL, ultima_vista_en = NULL
WHERE estado_conexion <> 'conectado';

-- ============================================================================
--  Los ultimos valores se fijan a mano, porque si no dependen de la hora a la
--  que se corra el script: corriendolo al mediodia TODAS las estaciones
--  quedarian fuera de rango y nunca se veria la tarjeta en verde.
--
--  La Esperanza: todo comodo dentro de rango -> Conectada.
-- ============================================================================
UPDATE sensores SET ultimo_valor = '24.5'  WHERE nombre_sensor = 'Temperatura - La Esperanza';
UPDATE sensores SET ultimo_valor = '62'    WHERE nombre_sensor = 'Humedad - La Esperanza';
UPDATE sensores SET ultimo_valor = '4'     WHERE nombre_sensor = 'UV - La Esperanza';
UPDATE sensores SET ultimo_valor = '45000' WHERE nombre_sensor = 'Luminosidad - La Esperanza';

--  Los Naranjos: los numeros de la pantalla del diseño -> Con alerta.
UPDATE sensores SET ultimo_valor = '34.2' WHERE nombre_sensor = 'Temperatura - Los Naranjos';
UPDATE sensores SET ultimo_valor = '38'   WHERE nombre_sensor = 'Humedad - Los Naranjos';
UPDATE sensores SET ultimo_valor = '9'    WHERE nombre_sensor = 'UV - Los Naranjos';
UPDATE sensores SET ultimo_valor = '88000' WHERE nombre_sensor = 'Luminosidad - Los Naranjos';

-- Las alertas que esos dos valores generan
INSERT INTO sensor_alertas (sensor_id, valor, umbral, tipo, fecha_alerta, lote_id)
SELECT s.id, 9, 8, 'max', NOW() - INTERVAL '6 minutes', s.lote_id
FROM sensores s WHERE s.nombre_sensor = 'UV - Los Naranjos';

INSERT INTO sensor_alertas (sensor_id, valor, umbral, tipo, fecha_alerta, lote_id)
SELECT s.id, 88000, 80000, 'max', NOW() - INTERVAL '4 minutes', s.lote_id
FROM sensores s WHERE s.nombre_sensor = 'Luminosidad - Los Naranjos';

COMMIT;

-- ============================================================================
--  Comprobacion rapida: deberia dar 11 sensores y ~3700 lecturas.
-- ============================================================================
SELECT
    (SELECT count(*) FROM tipos_sensores)  AS tipos,
    (SELECT count(*) FROM sensores)        AS sensores,
    (SELECT count(*) FROM sensor_lecturas) AS lecturas,
    (SELECT count(*) FROM sensor_alertas)  AS alertas;
