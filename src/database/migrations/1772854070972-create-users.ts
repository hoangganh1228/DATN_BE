import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1772854070972 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`users\` (
            \`id\`            INT             NOT NULL AUTO_INCREMENT,
            \`full_name\`     VARCHAR(100)    NOT NULL,
            \`email\`         VARCHAR(150)    NULL UNIQUE,
            \`password\` VARCHAR(255)    NULL,
            \`phone\`         VARCHAR(20)     NULL,
            \`address\`       TEXT            NULL,
            \`role\` ENUM('000', '111', '999') NOT NULL DEFAULT '000',
            \`avatar\`        VARCHAR(255)    NULL,
            \`is_active\`     BOOLEAN         NOT NULL DEFAULT TRUE,
            \`created_at\`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
      }

}
