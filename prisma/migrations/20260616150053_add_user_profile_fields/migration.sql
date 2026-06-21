-- AlterTable
ALTER TABLE `user` ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `profileComplete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `university` VARCHAR(191) NULL;
