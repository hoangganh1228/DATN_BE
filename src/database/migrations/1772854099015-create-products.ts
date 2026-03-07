import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1772854099015 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`products\` (
            \`id\`              INT             NOT NULL AUTO_INCREMENT,
            \`category_id\`     INT             NULL,
            \`name\`            VARCHAR(200)    NOT NULL,
            \`slug\`            VARCHAR(220)    NULL UNIQUE,
            \`description\`     TEXT            NULL,
            \`price\`           DECIMAL(15, 2)  NOT NULL,
            \`sale_price\`      DECIMAL(15, 2)  NULL,
            \`stock_quantity\`  INT             NOT NULL DEFAULT 0,
            \`image\`       VARCHAR(255)    NULL,
            \`status\`          VARCHAR(20)     NOT NULL DEFAULT 'active'
                                COMMENT 'active | inactive | out_of_stock',
            \`created_at\`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_products_category\`
              FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`)
              ON DELETE SET NULL
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
      }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`products\``);
    }

}
