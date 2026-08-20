import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Carga todas las entidades del proyecto para que CLI y migraciones incluyan todos los modulos.
    entities: [
        __dirname + '/**/*.entity{.ts,.js}',
        __dirname + '/**/*.orm-entity{.ts,.js}',
    ],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
}); 