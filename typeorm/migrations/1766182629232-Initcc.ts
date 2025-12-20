import { MigrationInterface, QueryRunner } from "typeorm";

export class Initcc1766182629232 implements MigrationInterface {
    name = 'Initcc1766182629232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`description\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`description\` varchar(255) NULL`);
    }

}
