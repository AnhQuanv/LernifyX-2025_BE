import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCreateCategoryAndCourse1760958203796 implements MigrationInterface {
    name = 'InitCreateCategoryAndCourse1760958203796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`course\` (\`id\` uuid NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`duration\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`original_price\` decimal(10,2) NULL, \`image\` varchar(255) NOT NULL, \`rating\` decimal(3,2) NOT NULL DEFAULT '0.00', \`students\` int NOT NULL DEFAULT '0', \`level\` varchar(50) NULL, \`discount\` decimal(5,2) NULL, \`discountExpiresAt\` timestamp NULL, \`status\` enum ('draft', 'pending', 'published', 'archived') NOT NULL DEFAULT 'draft', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`category_id\` uuid NULL, \`instructor_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_2f133fd8aa7a4d85ff7cd6f7c98\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_deca5c9911b3b2100b361060826\` FOREIGN KEY (\`instructor_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_deca5c9911b3b2100b361060826\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_2f133fd8aa7a4d85ff7cd6f7c98\``);
        await queryRunner.query(`DROP TABLE \`course\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
