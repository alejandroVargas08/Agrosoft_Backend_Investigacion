# Datos de prueba para la sustentacion

Dos scripts para dejar la base con un juego de datos coherente, en vez de los
registros sueltos que quedaron de las pruebas de desarrollo.

## Como se corren

En pgAdmin, sobre la base `Agrosoft_DB`:

1. Clic derecho en la base -> **Query Tool**
2. Abrir `01-limpiar-datos-prueba.sql` -> **F5**
3. Abrir `02-datos-sustentacion.sql` -> **F5**

Siempre en ese orden. El seed se niega a correr si la base todavia tiene datos.

> Antes de la primera vez vale la pena sacar un respaldo:
> clic derecho en la base -> **Backup**. La limpieza no se puede deshacer.

## Que borra y que no

Se borra todo el dato operativo: territorio, cultivos, cosechas, ventas,
finanzas, inventario, sensores, actividades, incidencias y Wiki EPA.

**No se toca** `usuarios`, `roles`, `permisos`, `rol_permisos`,
`permisos_de_usuarios`, `programas_formacion`, `usuario_programas_formacion`,
`email_codes`, `telegram_usuarios` ni `iot_global_config`. La cuenta con la que
entras y sus permisos quedan igual: no hay que volver a registrarse ni a
vincular el bot de Telegram.

## Que queda cargado

Una finca cafetera en Pitalito, Huila:

| | |
|---|---|
| Lotes y sublotes | 3 y 3, con geometria real (PostGIS calcula las areas) |
| Productos y cultivos | 5 y 5 — 4 activos, 1 finalizado |
| Cosechas | 7, repartidas entre mayo y octubre de 2026 (2.860 kg) |
| Clientes | 4 |
| Ventas | 5 — 2 pagadas, 2 pendientes, 1 anulada |
| Finanzas | 9 movimientos (7 egresos, 2 ingresos) |
| Insumos | 5 — 2 quedan bajo el minimo |
| Sensores | 4, con 3 alertas activas |
| Actividades | 6 — 3 generan alerta |
| Incidencias y tratamientos | 3 y 3 |
| Wiki EPA | 5 fichas |

### Lo que debe mostrar cada pantalla

**Reportes** (periodo mensual)

| Indicador | Valor |
|---|---|
| Produccion total | 2.860 kg |
| Unidades activas | 4 |
| Ingresos | $ 7.660.000 |
| Egresos | $ 5.075.000 |
| Rentabilidad | 34 % |

Los ingresos no cuentan la venta anulada. La grafica de barras sale con un
cultivo distinto por mes, de mayo a octubre.

**Alertas** — 8 en total: 3 de sensor (1 alta, 2 medias), 2 de stock (1 alta
por agotado, 1 media) y 3 de tarea (vencida, de hoy y de pasado manana).

**Ventas** — la venta anulada conserva sus 600 kg de platano en el lote de
produccion, igual que si la hubieras anulado desde la pantalla. Las otras
cuatro ya vienen descontadas del stock.

## Detalles que importan

- **Las fechas de las alertas son relativas a `CURRENT_DATE`.** Las actividades
  y las alertas de sensor se calculan contra el dia en que corres el script,
  asi que siempre suenan, sin importar cuando lo hagas. El resto de fechas son
  fijas (mayo a octubre de 2026) para que los reportes tengan historia.
- **`programa_formacion_id` queda en `NULL` en los lotes.** Asi cualquier
  usuario los ve, sin importar su ficha: el filtro de alcance trata el `NULL`
  como visible para todos.
- **El autor de todo es el usuario de menor id.** El script lo busca solo. Si
  no hay ningun usuario, se detiene con un mensaje claro.
- **Mayusculas que importan.** `tipo_epa` va en mayuscula (`PLAGA`,
  `ENFERMEDAD`, `ARVENSE`) porque la pantalla resuelve el icono con eso. El
  estado de las actividades va capitalizado (`Pendiente`, `En_progreso`,
  `Completada`) porque asi filtra el hook de alertas. Los estados de cultivo y
  de venta van en minuscula.
- **El seed es un solo bloque `DO`**, o sea una sola transaccion: si algo falla,
  no queda nada a medias.

## Comprobacion

Al final de `02-datos-sustentacion.sql` hay cinco consultas que verifican el
resultado: conteo por tabla, los indicadores de Reportes, que el total de cada
venta cuadre con sus detalles, que el stock de cada cosecha cuadre con lo
vendido, y el conteo de alertas por origen.

Las dos ultimas traen una columna `cuadra`. Si en alguna fila dice `REVISAR`,
hay algo descuadrado.

## Verificado

Los dos scripts se probaron el 26 de octubre de 2026 contra PostgreSQL 16 con
PostGIS 3.4, sobre el esquema generado por TypeORM a partir de las entidades de
este repositorio. Corren sin errores y las cinco comprobaciones pasan.
