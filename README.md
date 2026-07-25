# Agrosoft

Backend en NestJS para la gestión de procesos agrícolas.

## Descripción

Agrosoft: Sistema de gestión de cultivos para el Tecnoparque Yamboró. Proyecto formativo SENA.

## Tecnologías

- NestJS
- TypeORM
- PostgreSQL
- Docker
- TypeScript

## Ejecución

Instalar dependencias:

    npm install

Levantar la base de datos con Docker:

    docker compose up --build -d

Ejecutar en desarrollo:

    npm run start:dev

## Variables de entorno

    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=tu_clave
    DB_NAME=agrosoft

---

Desarrollado por aprendices SENA.
