import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUsersRoleDefault9991772863080000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`role\` ENUM('000', '111', '999') NOT NULL DEFAULT '999';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`role\` ENUM('000', '111', '999') NOT NULL DEFAULT '000';
    `);
  }
}
