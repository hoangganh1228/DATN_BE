import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrders1772854141128 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`orders\` (
            \`id\`               INT             NOT NULL AUTO_INCREMENT,
            \`user_id\`          INT             NOT NULL,
            \`total_amount\`     DECIMAL(15, 2)  NOT NULL,
            \`status\`           VARCHAR(20)     NOT NULL DEFAULT 'pending'
                                 COMMENT 'pending | confirmed | shipping | completed | cancelled',
            \`shipping_address\` TEXT            NOT NULL,
            \`payment_method\`   VARCHAR(50)     NULL,
            \`payment_status\`   VARCHAR(20)     NULL DEFAULT 'unpaid'
                                 COMMENT 'unpaid | paid | refunded',
            \`note\`             TEXT            NULL,
            \`created_at\`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_orders_user\`
              FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
              ON DELETE RESTRICT
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`order_items\` (
            \`id\`            INT             NOT NULL AUTO_INCREMENT,
            \`order_id\`     INT             NOT NULL,
            \`product_id\`   INT             NULL,
            \`product_name\` VARCHAR(200)    NOT NULL,
            \`unit_price\`   DECIMAL(15, 2)  NOT NULL,
            \`quantity\`     INT             NOT NULL,
            \`subtotal\`     DECIMAL(15, 2)  NOT NULL,
            \`created_at\`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`fk_order_items_order\`
              FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            CONSTRAINT \`fk_order_items_product\`
              FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
              ON DELETE SET NULL
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`order_items\``);
        await queryRunner.query(`DROP TABLE IF EXISTS \`orders\``);
    }
}
