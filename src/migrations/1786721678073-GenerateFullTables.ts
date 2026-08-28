import { MigrationInterface, QueryRunner } from "typeorm";

export class GenerateFullTables1786721678073 implements MigrationInterface {
    name = 'GenerateFullTables1786721678073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wiki_tipo_epa" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre" character varying NOT NULL, "descripcion" text NOT NULL, "tipo_epa_enum" character varying NOT NULL, CONSTRAINT "PK_9dfa111ec6b634a076d666fd852" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipos_cultivos_wiki" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre" character varying NOT NULL, "descripcion" text NOT NULL, CONSTRAINT "PK_b6eab974e49fd96658f753c0886" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "epas" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre" character varying NOT NULL, "tipo_epa" character varying NOT NULL, "descripcion" text NOT NULL, "sintomas" text NOT NULL, "manejo_y_control" text NOT NULL, "meses_probables" integer array NOT NULL, "temporadas" text array NOT NULL, "notas_estacionalidad" text, "fotos_sintomas" text array NOT NULL DEFAULT '{}', "fotos_generales" text array NOT NULL DEFAULT '{}', "etiquetas" text array NOT NULL DEFAULT '{}', "creado_por_usuario_id" integer NOT NULL, CONSTRAINT "PK_8d23543eb1e7a3929bdf5b5805a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipos_sensores" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre" character varying NOT NULL, "unidad" character varying NOT NULL, "decimales" integer NOT NULL, "descripcion" character varying, "imagen" character varying, "ttl_minutos" integer NOT NULL, CONSTRAINT "PK_3421868655076bc65fe3e356046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensores" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre_sensor" character varying NOT NULL, "tipo_sensor_id" integer NOT NULL, "protocolo" character varying NOT NULL, "endpoint_url" character varying, "mqtt_topic" character varying, "valor_minimo_sensor" double precision NOT NULL, "valor_maximo_sensor" double precision NOT NULL, "activo" boolean NOT NULL DEFAULT true, "estado_conexion" character varying NOT NULL DEFAULT 'desconectado', "estado" text, "ultimo_valor" character varying, "ultima_medicion" TIMESTAMP, "ultima_vista_en" TIMESTAMP, "cultivo_id" integer, "creado_por_usuario_id" integer NOT NULL, "global_config_id" integer, "lote_id" integer, "sub_lote_id" integer, CONSTRAINT "PK_17e80466352f77aff22e06ad334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_lecturas" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "sensor_id" integer NOT NULL, "valor" character varying NOT NULL, "fecha_lectura" TIMESTAMP WITH TIME ZONE NOT NULL, "unidad" character varying NOT NULL, "observaciones" character varying, CONSTRAINT "PK_b447a0350b6c07bb4e90c94b8d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sensor_alertas" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "sensor_id" integer NOT NULL, "valor" double precision NOT NULL, "umbral" double precision NOT NULL, "tipo" character varying(10) NOT NULL, "fecha_alerta" TIMESTAMP NOT NULL, "lote_id" integer, "sub_lote_id" integer, CONSTRAINT "PK_982ef165c7399c3445d6ef2fa5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "iot_global_config" ("id" SERIAL NOT NULL, "creado_en" TIMESTAMP NOT NULL DEFAULT now(), "actualizado_en" TIMESTAMP NOT NULL DEFAULT now(), "eliminado_en" TIMESTAMP, "nombre" character varying NOT NULL, "agente" character varying NOT NULL, "puerto" integer NOT NULL, "protocolo" character varying NOT NULL, "prefijo_tema" character varying NOT NULL, "temas_predeterminados" text, "temas_personalizados" text, "lote_id" integer, "sub_lote_id" integer, "nombre_usuario" character varying NOT NULL, "contrasena" character varying NOT NULL, "activo" boolean NOT NULL DEFAULT true, "sensores_predeterminados_inicializados" boolean NOT NULL DEFAULT false, "auto_discover" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a8b84a85152d2dd48919f4d1480" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "iot_global_config"`);
        await queryRunner.query(`DROP TABLE "sensor_alertas"`);
        await queryRunner.query(`DROP TABLE "sensor_lecturas"`);
        await queryRunner.query(`DROP TABLE "sensores"`);
        await queryRunner.query(`DROP TABLE "tipos_sensores"`);
        await queryRunner.query(`DROP TABLE "epas"`);
        await queryRunner.query(`DROP TABLE "tipos_cultivos_wiki"`);
        await queryRunner.query(`DROP TABLE "wiki_tipo_epa"`);
    }

}
