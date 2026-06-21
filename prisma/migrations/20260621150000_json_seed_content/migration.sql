-- DropForeignKey
ALTER TABLE `InterviewExperience` DROP FOREIGN KEY `InterviewExperience_userId_fkey`;

-- DropIndex
DROP INDEX `InterviewExperience_userId_idx` ON `InterviewExperience`;

-- Clear legacy user-submitted rows before converting the table to curated JSON-seeded content.
DELETE FROM `InterviewExperience`;

-- AlterTable
ALTER TABLE `InterviewExperience`
    DROP COLUMN `content`,
    DROP COLUMN `userId`,
    MODIFY `date` VARCHAR(191) NOT NULL,
    ADD COLUMN `topics` VARCHAR(191) NOT NULL,
    ADD COLUMN `summary` TEXT NOT NULL,
    ADD COLUMN `fullUrl` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Hackathon` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `organizer` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `deadline` VARCHAR(191) NOT NULL,
    `tags` VARCHAR(191) NOT NULL,
    `registrationUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
