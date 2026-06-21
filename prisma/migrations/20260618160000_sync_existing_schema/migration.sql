-- This migration records schema changes that already exist in the local database.
-- It is marked as applied for the current dev DB to avoid a destructive reset.

ALTER TABLE `Problem`
    ADD COLUMN `company` VARCHAR(191) NOT NULL DEFAULT 'General',
    ADD COLUMN `url` VARCHAR(191) NULL;

ALTER TABLE `Submission`
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'UNSEEN';

CREATE UNIQUE INDEX `Submission_userId_problemId_key` ON `Submission`(`userId`, `problemId`);

ALTER TABLE `User`
    ADD COLUMN `organization` VARCHAR(191) NULL,
    ADD COLUMN `onboardingCompleted` BOOLEAN NOT NULL DEFAULT false;
