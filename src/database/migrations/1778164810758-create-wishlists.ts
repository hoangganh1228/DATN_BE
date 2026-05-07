import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWishlists1778164810758 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`wishlists\` (
            \`id\`         INT       NOT NULL AUTO_INCREMENT,
            \`user_id\`    INT       NOT NULL,
            \`product_id\` INT       NOT NULL,
            \`created_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uq_wishlist_user_product\` (\`user_id\`, \`product_id\`),
            INDEX \`idx_wishlist_user\` (\`user_id\`),
            CONSTRAINT \`fk_wishlists_user\`
              FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            CONSTRAINT \`fk_wishlists_product\`
              FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`wishlists\``);
    }
}
