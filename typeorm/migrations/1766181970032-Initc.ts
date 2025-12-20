import { MigrationInterface, QueryRunner } from "typeorm";

export class Initc1766181970032 implements MigrationInterface {
    name = 'Initc1766181970032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`description\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`description\``);
    }

}
