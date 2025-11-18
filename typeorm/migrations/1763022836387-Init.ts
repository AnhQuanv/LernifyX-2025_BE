import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1763022836387 implements MigrationInterface {
    name = 'Init1763022836387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`comment\` (\`id\` uuid NOT NULL, \`content\` text NOT NULL, \`rating\` int NULL, \`type\` varchar(20) NOT NULL DEFAULT 'lesson', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` uuid NULL, \`course_id\` uuid NULL, \`lesson_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson\` (\`id\` uuid NOT NULL, \`title\` varchar(255) NOT NULL, \`duration\` int NOT NULL COMMENT 'Duration in minutes', \`video_url\` varchar(255) NULL, \`order\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`chapter_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chapter\` (\`id\` uuid NOT NULL, \`title\` varchar(255) NOT NULL, \`order\` int NOT NULL DEFAULT '0', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`course_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` uuid NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`course\` (\`id\` uuid NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`requirements\` json NULL, \`learnings\` json NULL, \`duration\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`original_price\` decimal(10,2) NULL, \`image\` varchar(255) NOT NULL, \`rating\` decimal(3,2) NOT NULL DEFAULT '0.00', \`students\` int NOT NULL DEFAULT '0', \`level\` varchar(50) NULL, \`discount\` decimal(5,2) NULL, \`discountExpiresAt\` timestamp NULL, \`status\` enum ('draft', 'pending', 'published', 'archived') NOT NULL DEFAULT 'draft', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`category_id\` uuid NULL, \`instructor_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wishlist\` (\`id\` uuid NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` uuid NULL, \`course_id\` uuid NULL, UNIQUE INDEX \`IDX_fe3bff280a26673bd4a78574d5\` (\`user_id\`, \`course_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_token\` (\`refresh_token_id\` uuid NOT NULL, \`token\` text NOT NULL, \`expires_at\` timestamp NOT NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userUserId\` uuid NULL, PRIMARY KEY (\`refresh_token_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`role_id\` uuid NOT NULL, \`role_name\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4810bc474fe6394c6f58cb7c9e\` (\`role_name\`), PRIMARY KEY (\`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_item\` (\`id\` uuid NOT NULL, \`isPurchased\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` uuid NULL, \`course_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_items\` (\`id\` uuid NOT NULL, \`price\` decimal(10,2) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`payment_id\` uuid NULL, \`course_id\` uuid NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` uuid NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`gateway\` varchar(255) NOT NULL, \`gateway_transaction_id\` varchar(255) NULL, \`transaction_ref\` varchar(255) NOT NULL, \`currency\` varchar(255) NOT NULL DEFAULT 'VND', \`order_info\` text NULL, \`pay_url\` text NULL, \`paid_at\` datetime NULL, \`message\` text NULL, \`bankCode\` varchar(50) NULL, \`response_code\` varchar(10) NULL, \`raw_response\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` uuid NULL, UNIQUE INDEX \`IDX_f0eea471026ce4a3279bdba938\` (\`transaction_ref\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` uuid NOT NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`date_of_birth\` date NULL, \`address\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 0, \`code_id\` int NULL, \`code_expires_at\` timestamp NULL, \`avatar\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`role_id\` uuid NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_bbfe153fa60aa06483ed35ff4a7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_2d70a4dcee01cc63e073a85802b\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_564483d1b97a84ac46892afb84f\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lesson\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson\` ADD CONSTRAINT \`FK_cda7676f5f73f9b60650dd405f8\` FOREIGN KEY (\`chapter_id\`) REFERENCES \`chapter\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chapter\` ADD CONSTRAINT \`FK_be4eebd798cc26bd6bded42f8c0\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_2f133fd8aa7a4d85ff7cd6f7c98\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_deca5c9911b3b2100b361060826\` FOREIGN KEY (\`instructor_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_512bf776587ad5fc4f804277d76\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_aa21207f948bd5163c86822d9d5\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_e45ab0495d24a774bd49731b7a5\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_3f1aaffa650d3e443f32459c4c5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_d0599514eccb2bf2561849f4ccc\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_items\` ADD CONSTRAINT \`FK_c03172d6a1edb318ab03bdbb883\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_items\` ADD CONSTRAINT \`FK_3e259ca95d1f41287843424c674\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_c66c60a17b56ec882fcd8ec770b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`role_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_c66c60a17b56ec882fcd8ec770b\``);
        await queryRunner.query(`ALTER TABLE \`payment_items\` DROP FOREIGN KEY \`FK_3e259ca95d1f41287843424c674\``);
        await queryRunner.query(`ALTER TABLE \`payment_items\` DROP FOREIGN KEY \`FK_c03172d6a1edb318ab03bdbb883\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_d0599514eccb2bf2561849f4ccc\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_3f1aaffa650d3e443f32459c4c5\``);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_e45ab0495d24a774bd49731b7a5\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_aa21207f948bd5163c86822d9d5\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_512bf776587ad5fc4f804277d76\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_deca5c9911b3b2100b361060826\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_2f133fd8aa7a4d85ff7cd6f7c98\``);
        await queryRunner.query(`ALTER TABLE \`chapter\` DROP FOREIGN KEY \`FK_be4eebd798cc26bd6bded42f8c0\``);
        await queryRunner.query(`ALTER TABLE \`lesson\` DROP FOREIGN KEY \`FK_cda7676f5f73f9b60650dd405f8\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_564483d1b97a84ac46892afb84f\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_2d70a4dcee01cc63e073a85802b\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_bbfe153fa60aa06483ed35ff4a7\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_f0eea471026ce4a3279bdba938\` ON \`payment\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP TABLE \`payment_items\``);
        await queryRunner.query(`DROP TABLE \`cart_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_4810bc474fe6394c6f58cb7c9e\` ON \`role\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`refresh_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe3bff280a26673bd4a78574d5\` ON \`wishlist\``);
        await queryRunner.query(`DROP TABLE \`wishlist\``);
        await queryRunner.query(`DROP TABLE \`course\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`chapter\``);
        await queryRunner.query(`DROP TABLE \`lesson\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
    }

}
