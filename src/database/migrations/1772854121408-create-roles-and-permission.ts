import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesAndPermission1772854121408 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`roles\` (
            \`id\`          INT             NOT NULL AUTO_INCREMENT,
            \`name\`        VARCHAR(50)     NULL UNIQUE,
            \`description\` VARCHAR(200)    NULL,
            \`created_at\`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`permissions\` (
            \`id\`            INT             NOT NULL AUTO_INCREMENT,
            \`name\`          VARCHAR(100)    NULL UNIQUE,
            \`action\`        VARCHAR(50)     NOT NULL
                              COMMENT 'create | read | update | delete',
            \`description\`   VARCHAR(200)    NULL,
            \`created_at\`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`role_permissions\` (
            \`role_id\`       INT       NOT NULL,
            \`permission_id\` INT       NOT NULL,
            \`created_at\`    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`    DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`role_id\`, \`permission_id\`),
            CONSTRAINT \`fk_role_permissions_role\`
              FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            CONSTRAINT \`fk_role_permissions_permission\`
              FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`user_roles\` (
            \`user_id\`    INT       NOT NULL,
            \`role_id\`    INT       NOT NULL,
            \`created_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`user_id\`, \`role_id\`),
            CONSTRAINT \`fk_user_roles_user\`
              FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            CONSTRAINT \`fk_user_roles_role\`
              FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`user_roles\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`role_permissions\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`permissions\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`roles\``);
    }

}
