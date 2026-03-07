import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePasswordResets1772854176152 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`password_resets\` (
            \`id\`         INT          NOT NULL AUTO_INCREMENT,
            \`user_id\`    INT          NOT NULL,
            \`otp\`        VARCHAR(6)   NULL UNIQUE,
            \`expires_at\` DATETIME     NOT NULL,
            \`created_at\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_password_resets_user\`
              FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`password_resets\``);
    }
}
