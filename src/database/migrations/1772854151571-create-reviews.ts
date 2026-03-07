import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReviews1772854151571 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS \`reviews\` (
            \`id\`         INT       NOT NULL AUTO_INCREMENT,
            \`user_id\`    INT       NOT NULL,
            \`product_id\` INT       NOT NULL,
            \`rating\`     INT       NOT NULL COMMENT 'value from 1 to 5',
            \`comment\`    TEXT      NULL,
            \`created_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uq_review_user_product\` (\`user_id\`, \`product_id\`),
            CONSTRAINT \`chk_reviews_rating\` CHECK (\`rating\` BETWEEN 1 AND 5),
            CONSTRAINT \`fk_reviews_user\`
              FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE,
            CONSTRAINT \`fk_reviews_product\`
              FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`)
              ON DELETE CASCADE
              ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`reviews\``);
    }
}
