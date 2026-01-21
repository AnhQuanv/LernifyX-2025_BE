import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1768970569429 implements MigrationInterface {
    name = 'Init1768970569429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`comment\` (\`id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`rating\` int NULL, \`type\` varchar(20) NOT NULL DEFAULT 'lesson', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`parent_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, \`course_id\` varchar(36) NULL, \`lesson_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson_note\` (\`id\` varchar(36) NOT NULL, \`text\` text NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`video_timestamp\` float NOT NULL DEFAULT '0', \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`progressId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson_progress\` (\`id\` varchar(36) NOT NULL, \`completed\` tinyint NOT NULL DEFAULT 0, \`lastPosition\` int NOT NULL DEFAULT '0', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`userUserId\` varchar(36) NULL, \`lessonId\` varchar(36) NULL, UNIQUE INDEX \`IDX_f41858fcdbacf554115893092e\` (\`userUserId\`, \`lessonId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`quiz_option\` (\`id\` varchar(255) NOT NULL, \`text\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`question_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`quiz_question\` (\`id\` varchar(255) NOT NULL, \`question\` text NULL, \`correct_option_id\` varchar(255) NULL, \`order\` int NOT NULL DEFAULT '0', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`lesson_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson_video\` (\`id\` varchar(36) NOT NULL, \`public_id\` varchar(255) NOT NULL, \`original_url\` varchar(255) NULL, \`duration\` int NOT NULL DEFAULT '0', \`width_original\` int NULL, \`height_original\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lesson\` (\`id\` varchar(255) NOT NULL, \`title\` varchar(255) NULL, \`content\` text NULL, \`duration\` int NULL COMMENT 'Duration in second', \`parent_id\` varchar(255) NULL, \`video_id\` varchar(255) NULL, \`order\` int NOT NULL DEFAULT '0', \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`chapter_id\` varchar(36) NULL, UNIQUE INDEX \`REL_ddfb00dc35a3c857190a78797a\` (\`video_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chapter\` (\`id\` varchar(255) NOT NULL, \`title\` varchar(255) NULL, \`order\` int NOT NULL DEFAULT '0', \`parent_id\` varchar(255) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`course_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` varchar(36) NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`gateway\` varchar(255) NOT NULL, \`is_activated\` tinyint NOT NULL DEFAULT 0, \`gateway_transaction_id\` varchar(255) NULL, \`transaction_ref\` varchar(255) NOT NULL, \`currency\` varchar(255) NOT NULL DEFAULT 'VND', \`order_info\` text NULL, \`pay_url\` text NULL, \`paid_at\` datetime NULL, \`message\` text NULL, \`bankCode\` varchar(50) NULL, \`response_code\` varchar(10) NULL, \`raw_response\` longtext NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_f0eea471026ce4a3279bdba938\` (\`transaction_ref\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_items\` (\`id\` varchar(36) NOT NULL, \`price\` decimal(15,2) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`payment_id\` varchar(36) NULL, \`course_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`course\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NULL, \`description\` text NULL, \`requirements\` longtext NULL, \`learnings\` longtext NULL, \`duration\` int NULL, \`price\` decimal(15,2) NULL, \`original_price\` decimal(15,2) NULL, \`image\` varchar(255) NULL, \`rating\` decimal(3,2) NOT NULL DEFAULT '0.00', \`ratingCount\` int NOT NULL DEFAULT '0', \`students\` int NOT NULL DEFAULT '0', \`level\` varchar(50) NULL, \`discount\` decimal(5,2) NULL, \`discountExpiresAt\` timestamp NULL, \`status\` enum ('draft', 'pending', 'published', 'rejected ', 'archived') NOT NULL DEFAULT 'draft', \`rejection_reason\` text NULL, \`archive_reason\` text NULL, \`submission_note\` text NULL, \`is_live\` tinyint NOT NULL DEFAULT 0, \`parent_id\` varchar(255) NULL, \`has_draft\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`category_id\` varchar(36) NULL, \`instructor_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wishlist\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NULL, \`course_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_fe3bff280a26673bd4a78574d5\` (\`user_id\`, \`course_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_token\` (\`refresh_token_id\` varchar(36) NOT NULL, \`token\` text NOT NULL, \`expires_at\` timestamp NOT NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`userUserId\` varchar(36) NULL, PRIMARY KEY (\`refresh_token_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`role_id\` varchar(36) NOT NULL, \`role_name\` varchar(255) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_4810bc474fe6394c6f58cb7c9e\` (\`role_name\`), PRIMARY KEY (\`role_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart_item\` (\`id\` varchar(36) NOT NULL, \`isPurchased\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`user_id\` varchar(36) NULL, \`course_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` varchar(36) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`date_of_birth\` date NULL, \`address\` varchar(255) NULL, \`bio\` varchar(255) NULL, \`description\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 0, \`code_id\` int NULL, \`code_expires_at\` timestamp NULL, \`avatar\` varchar(255) NULL, \`has_preferences\` tinyint NOT NULL DEFAULT 0, \`is_disabled\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(), \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP, \`role_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_preference\` (\`id\` int NOT NULL AUTO_INCREMENT, \`desiredLevels\` text NULL, \`learningGoals\` text NULL, \`interestedSkills\` text NULL, \`userUserId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_preference_main_categories_category\` (\`userPreferenceId\` int NOT NULL, \`categoryId\` varchar(36) NOT NULL, INDEX \`IDX_e6cb779091a50d6bc2b24a68eb\` (\`userPreferenceId\`), INDEX \`IDX_1b43e703486a864894aba9de45\` (\`categoryId\`), PRIMARY KEY (\`userPreferenceId\`, \`categoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_8bd8d0985c0d077c8129fb4a209\` FOREIGN KEY (\`parent_id\`) REFERENCES \`comment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_bbfe153fa60aa06483ed35ff4a7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_2d70a4dcee01cc63e073a85802b\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_564483d1b97a84ac46892afb84f\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lesson\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_note\` ADD CONSTRAINT \`FK_082a84bb972f30c4b25b67024f0\` FOREIGN KEY (\`progressId\`) REFERENCES \`lesson_progress\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD CONSTRAINT \`FK_9fce182e214fa6a39ba40adb2b8\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD CONSTRAINT \`FK_df13299d2740b302dd44a368df9\` FOREIGN KEY (\`lessonId\`) REFERENCES \`lesson\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_option\` ADD CONSTRAINT \`FK_7b739095f34b3b5dca09844cc24\` FOREIGN KEY (\`question_id\`) REFERENCES \`quiz_question\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_question\` ADD CONSTRAINT \`FK_f136ba7ba996254d1cf914fab64\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lesson\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson\` ADD CONSTRAINT \`FK_ddfb00dc35a3c857190a78797a1\` FOREIGN KEY (\`video_id\`) REFERENCES \`lesson_video\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson\` ADD CONSTRAINT \`FK_cda7676f5f73f9b60650dd405f8\` FOREIGN KEY (\`chapter_id\`) REFERENCES \`chapter\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chapter\` ADD CONSTRAINT \`FK_be4eebd798cc26bd6bded42f8c0\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_c66c60a17b56ec882fcd8ec770b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_items\` ADD CONSTRAINT \`FK_c03172d6a1edb318ab03bdbb883\` FOREIGN KEY (\`payment_id\`) REFERENCES \`payment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment_items\` ADD CONSTRAINT \`FK_3e259ca95d1f41287843424c674\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_c43238a47721abf978351ce834c\` FOREIGN KEY (\`parent_id\`) REFERENCES \`course\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_2f133fd8aa7a4d85ff7cd6f7c98\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course\` ADD CONSTRAINT \`FK_deca5c9911b3b2100b361060826\` FOREIGN KEY (\`instructor_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_512bf776587ad5fc4f804277d76\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_aa21207f948bd5163c86822d9d5\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_e45ab0495d24a774bd49731b7a5\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_3f1aaffa650d3e443f32459c4c5\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart_item\` ADD CONSTRAINT \`FK_d0599514eccb2bf2561849f4ccc\` FOREIGN KEY (\`course_id\`) REFERENCES \`course\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`role_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_preference\` ADD CONSTRAINT \`FK_d4c96b1dd8f258273990581ea19\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_preference_main_categories_category\` ADD CONSTRAINT \`FK_e6cb779091a50d6bc2b24a68eb4\` FOREIGN KEY (\`userPreferenceId\`) REFERENCES \`user_preference\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_preference_main_categories_category\` ADD CONSTRAINT \`FK_1b43e703486a864894aba9de454\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_preference_main_categories_category\` DROP FOREIGN KEY \`FK_1b43e703486a864894aba9de454\``);
        await queryRunner.query(`ALTER TABLE \`user_preference_main_categories_category\` DROP FOREIGN KEY \`FK_e6cb779091a50d6bc2b24a68eb4\``);
        await queryRunner.query(`ALTER TABLE \`user_preference\` DROP FOREIGN KEY \`FK_d4c96b1dd8f258273990581ea19\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_d0599514eccb2bf2561849f4ccc\``);
        await queryRunner.query(`ALTER TABLE \`cart_item\` DROP FOREIGN KEY \`FK_3f1aaffa650d3e443f32459c4c5\``);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_e45ab0495d24a774bd49731b7a5\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_aa21207f948bd5163c86822d9d5\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_512bf776587ad5fc4f804277d76\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_deca5c9911b3b2100b361060826\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_2f133fd8aa7a4d85ff7cd6f7c98\``);
        await queryRunner.query(`ALTER TABLE \`course\` DROP FOREIGN KEY \`FK_c43238a47721abf978351ce834c\``);
        await queryRunner.query(`ALTER TABLE \`payment_items\` DROP FOREIGN KEY \`FK_3e259ca95d1f41287843424c674\``);
        await queryRunner.query(`ALTER TABLE \`payment_items\` DROP FOREIGN KEY \`FK_c03172d6a1edb318ab03bdbb883\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_c66c60a17b56ec882fcd8ec770b\``);
        await queryRunner.query(`ALTER TABLE \`chapter\` DROP FOREIGN KEY \`FK_be4eebd798cc26bd6bded42f8c0\``);
        await queryRunner.query(`ALTER TABLE \`lesson\` DROP FOREIGN KEY \`FK_cda7676f5f73f9b60650dd405f8\``);
        await queryRunner.query(`ALTER TABLE \`lesson\` DROP FOREIGN KEY \`FK_ddfb00dc35a3c857190a78797a1\``);
        await queryRunner.query(`ALTER TABLE \`quiz_question\` DROP FOREIGN KEY \`FK_f136ba7ba996254d1cf914fab64\``);
        await queryRunner.query(`ALTER TABLE \`quiz_option\` DROP FOREIGN KEY \`FK_7b739095f34b3b5dca09844cc24\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP FOREIGN KEY \`FK_df13299d2740b302dd44a368df9\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP FOREIGN KEY \`FK_9fce182e214fa6a39ba40adb2b8\``);
        await queryRunner.query(`ALTER TABLE \`lesson_note\` DROP FOREIGN KEY \`FK_082a84bb972f30c4b25b67024f0\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_564483d1b97a84ac46892afb84f\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_2d70a4dcee01cc63e073a85802b\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_bbfe153fa60aa06483ed35ff4a7\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_8bd8d0985c0d077c8129fb4a209\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b43e703486a864894aba9de45\` ON \`user_preference_main_categories_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_e6cb779091a50d6bc2b24a68eb\` ON \`user_preference_main_categories_category\``);
        await queryRunner.query(`DROP TABLE \`user_preference_main_categories_category\``);
        await queryRunner.query(`DROP TABLE \`user_preference\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`cart_item\``);
        await queryRunner.query(`DROP INDEX \`IDX_4810bc474fe6394c6f58cb7c9e\` ON \`role\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`refresh_token\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe3bff280a26673bd4a78574d5\` ON \`wishlist\``);
        await queryRunner.query(`DROP TABLE \`wishlist\``);
        await queryRunner.query(`DROP TABLE \`course\``);
        await queryRunner.query(`DROP TABLE \`payment_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_f0eea471026ce4a3279bdba938\` ON \`payment\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`chapter\``);
        await queryRunner.query(`DROP INDEX \`REL_ddfb00dc35a3c857190a78797a\` ON \`lesson\``);
        await queryRunner.query(`DROP TABLE \`lesson\``);
        await queryRunner.query(`DROP TABLE \`lesson_video\``);
        await queryRunner.query(`DROP TABLE \`quiz_question\``);
        await queryRunner.query(`DROP TABLE \`quiz_option\``);
        await queryRunner.query(`DROP INDEX \`IDX_f41858fcdbacf554115893092e\` ON \`lesson_progress\``);
        await queryRunner.query(`DROP TABLE \`lesson_progress\``);
        await queryRunner.query(`DROP TABLE \`lesson_note\``);
        await queryRunner.query(`DROP TABLE \`comment\``);
    }

}
