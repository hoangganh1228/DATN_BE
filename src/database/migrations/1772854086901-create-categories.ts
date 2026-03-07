import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1772854086901 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`categories\` (
            \`id\`          INT             NOT NULL AUTO_INCREMENT,
            \`parent_id\`   INT             NULL,
            \`name\`        VARCHAR(100)    NOT NULL,
            \`slug\`        VARCHAR(120)    NULL UNIQUE,
            \`description\` TEXT            NULL,
            \`image\`   VARCHAR(255)    NULL,
            \`created_at\`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_categories_parent\`
              FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\` (\`id\`)
              ON DELETE SET NULL
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`categories\``);
      }

}
